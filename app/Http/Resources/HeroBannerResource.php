<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use Spatie\MediaLibrary\MediaCollections\Models\Media;

class HeroBannerResource extends JsonResource
{
    private function mapImage(?Media $media): ?array
    {
        if (!$media) {
            return null;
        }

        return [
            'id'        => $media->id,
            'url'       => $media->getUrl(),
            'thumbnail' => $media->getUrl('thumbnail'),
            'hero'      => $media->getUrl('hero'),
        ];
    }

    public function toArray(Request $request): array
    {
        $legacyMedia = $this->getFirstMedia('banner');
        $desktopMedia = $this->getFirstMedia('banner_desktop') ?? $legacyMedia;
        $mobileMedia = $this->getFirstMedia('banner_mobile') ?? $legacyMedia;

        return [
            'id'         => $this->id,
            'title'      => $this->title,
            'subtitle'   => $this->subtitle,
            'link'       => $this->link,
            'sort_order' => $this->sort_order,
            'is_active'         => $this->is_active,
            'object_position'   => $this->object_position ?? 'center center',
            'image'             => [
                'desktop' => $this->mapImage($desktopMedia),
                'mobile' => $this->mapImage($mobileMedia),
            ],
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
