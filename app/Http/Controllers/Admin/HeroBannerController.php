<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\HeroBannerResource;
use App\Models\HeroBanner;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;
use Illuminate\Http\Response;

class HeroBannerController extends Controller
{
    /**
     * List all hero banners (admin sees every banner, including inactive).
     */
    public function index(): ResourceCollection
    {
        $banners = HeroBanner::query()
            ->with('media')
            ->ordered()
            ->get();

        return HeroBannerResource::collection($banners);
    }

    /**
     * Create a new hero banner with an image upload.
     */
    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'title'      => ['nullable', 'string', 'max:255'],
            'subtitle'   => ['nullable', 'string', 'max:255'],
            'link'       => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active'       => ['nullable', 'boolean'],
            'image_desktop'   => ['bail', 'required_without_all:image_mobile,image', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'image_mobile'    => ['bail', 'required_without_all:image_desktop,image', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'image'           => ['bail', 'nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'object_position' => ['nullable', 'string', 'max:50'],
        ], [
            'image_desktop.required_without_all' => 'Upload at least one image: desktop or mobile.',
            'image_mobile.required_without_all' => 'Upload at least one image: desktop or mobile.',
            'image_desktop.uploaded' => 'Desktop image upload failed before validation. Please use JPG/PNG/WEBP and keep it under 10 MB.',
            'image_mobile.uploaded' => 'Mobile image upload failed before validation. Please use JPG/PNG/WEBP and keep it under 10 MB.',
            'image.uploaded' => 'Image upload failed before validation. Please use JPG/PNG/WEBP and keep it under 10 MB.',
            'image_desktop.max' => 'Desktop image is too large. Maximum allowed size is 10 MB.',
            'image_mobile.max' => 'Mobile image is too large. Maximum allowed size is 10 MB.',
            'image.max' => 'Image is too large. Maximum allowed size is 10 MB.',
            'image_desktop.mimes' => 'Unsupported desktop image format. Allowed formats: JPG, PNG, WEBP.',
            'image_mobile.mimes' => 'Unsupported mobile image format. Allowed formats: JPG, PNG, WEBP.',
            'image.mimes' => 'Unsupported image format. Allowed formats: JPG, PNG, WEBP.',
        ]);

        $banner = HeroBanner::create([
            'title'           => $data['title'] ?? null,
            'subtitle'        => $data['subtitle'] ?? null,
            'link'            => $data['link'] ?? null,
            'sort_order'      => $data['sort_order'] ?? 0,
            'is_active'       => $data['is_active'] ?? true,
            'object_position' => $data['object_position'] ?? 'center center',
        ]);

        if ($request->hasFile('image_desktop')) {
            $banner->addMediaFromRequest('image_desktop')->toMediaCollection('banner_desktop');
        } elseif ($request->hasFile('image')) {
            $banner->addMediaFromRequest('image')->toMediaCollection('banner_desktop');
        }

        if ($request->hasFile('image_mobile')) {
            $banner->addMediaFromRequest('image_mobile')->toMediaCollection('banner_mobile');
        }

        $banner->load('media');

        return (new HeroBannerResource($banner))
            ->response()
            ->setStatusCode(201);
    }

    /**
     * Show a single hero banner.
     */
    public function show(HeroBanner $heroBanner): HeroBannerResource
    {
        $heroBanner->load('media');

        return new HeroBannerResource($heroBanner);
    }

    /**
     * Update an existing hero banner (optionally replace the image).
     */
    public function update(Request $request, HeroBanner $heroBanner): HeroBannerResource
    {
        $data = $request->validate([
            'title'      => ['nullable', 'string', 'max:255'],
            'subtitle'   => ['nullable', 'string', 'max:255'],
            'link'       => ['nullable', 'string', 'max:500'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'is_active'       => ['nullable', 'boolean'],
            'image_desktop'   => ['bail', 'nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'image_mobile'    => ['bail', 'nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'image'           => ['bail', 'nullable', 'file', 'image', 'mimes:jpg,jpeg,png,webp', 'max:10240'],
            'object_position' => ['nullable', 'string', 'max:50'],
            'remove_desktop'  => ['nullable', 'boolean'],
            'remove_mobile'   => ['nullable', 'boolean'],
        ], [
            'image_desktop.uploaded' => 'Desktop image upload failed before validation. Please use JPG/PNG/WEBP and keep it under 10 MB.',
            'image_mobile.uploaded' => 'Mobile image upload failed before validation. Please use JPG/PNG/WEBP and keep it under 10 MB.',
            'image.uploaded' => 'Image upload failed before validation. Please use JPG/PNG/WEBP and keep it under 10 MB.',
            'image_desktop.max' => 'Desktop image is too large. Maximum allowed size is 10 MB.',
            'image_mobile.max' => 'Mobile image is too large. Maximum allowed size is 10 MB.',
            'image.max' => 'Image is too large. Maximum allowed size is 10 MB.',
            'image_desktop.mimes' => 'Unsupported desktop image format. Allowed formats: JPG, PNG, WEBP.',
            'image_mobile.mimes' => 'Unsupported mobile image format. Allowed formats: JPG, PNG, WEBP.',
            'image.mimes' => 'Unsupported image format. Allowed formats: JPG, PNG, WEBP.',
        ]);

        // Update each field only when it was actually submitted;
        // fall back to the current DB value for booleans/integers so that
        // a partial update never accidentally clears them.
        $heroBanner->update([
            'title'           => $data['title'] ?? null,
            'subtitle'        => $data['subtitle'] ?? null,
            'link'           => $data['link'] ?? null,
            'sort_order'      => $data['sort_order'] ?? $heroBanner->sort_order,
            'is_active'       => array_key_exists('is_active', $data)
                ? (bool) $data['is_active']
                : $heroBanner->is_active,
            'object_position' => $data['object_position'] ?? $heroBanner->object_position,
        ]);

        // Process removals BEFORE adding new uploads
        if (!empty($data['remove_desktop'])) {
            $heroBanner->clearMediaCollection('banner_desktop');
            // Also clear legacy banner collection when desktop image is removed
            $heroBanner->clearMediaCollection('banner');
        }

        if (!empty($data['remove_mobile'])) {
            $heroBanner->clearMediaCollection('banner_mobile');
        }

        // Add new images
        if ($request->hasFile('image_desktop')) {
            $heroBanner->addMediaFromRequest('image_desktop')
                ->toMediaCollection('banner_desktop');
            // Clear legacy banner collection when new desktop image is uploaded (migrate old records)
            $heroBanner->clearMediaCollection('banner');
        } elseif ($request->hasFile('image')) {
            $heroBanner->addMediaFromRequest('image')
                ->toMediaCollection('banner_desktop');
            // Clear legacy banner collection
            $heroBanner->clearMediaCollection('banner');
        }

        if ($request->hasFile('image_mobile')) {
            $heroBanner->addMediaFromRequest('image_mobile')
                ->toMediaCollection('banner_mobile');
        }

        $heroBanner->load('media');

        return new HeroBannerResource($heroBanner);
    }

    /**
     * Delete a hero banner and its associated media.
     */
    public function destroy(HeroBanner $heroBanner): Response
    {
        $heroBanner->delete();

        return response()->noContent();
    }
}
