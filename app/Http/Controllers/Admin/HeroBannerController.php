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
            'image'           => ['required', 'image', 'max:5120'], // 5 MB
            'object_position' => ['nullable', 'string', 'max:50'],
        ]);

        $banner = HeroBanner::create([
            'title'           => $data['title'] ?? null,
            'subtitle'        => $data['subtitle'] ?? null,
            'link'            => $data['link'] ?? null,
            'sort_order'      => $data['sort_order'] ?? 0,
            'is_active'       => $data['is_active'] ?? true,
            'object_position' => $data['object_position'] ?? 'center center',
        ]);

        $banner->addMediaFromRequest('image')
            ->toMediaCollection('banner');

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
            'image'           => ['nullable', 'image', 'max:5120'],
            'object_position' => ['nullable', 'string', 'max:50'],
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

        if ($request->hasFile('image')) {
            $heroBanner->addMediaFromRequest('image')
                ->toMediaCollection('banner'); // singleFile() auto-removes the old one
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
