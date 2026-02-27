<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HeroBannerResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $media = $this->getFirstMedia('banner');

        return [
            'id'         => $this->id,
            'title'      => $this->title,
            'subtitle'   => $this->subtitle,
            'link'       => $this->link,
            'sort_order' => $this->sort_order,
            'is_active'  => $this->is_active,
            'image'      => $media ? [
                'id'        => $media->id,
                'url'       => $media->getUrl(),
                'thumbnail' => $media->getUrl('thumbnail'),
                'hero'      => $media->getUrl('hero'),
            ] : null,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
