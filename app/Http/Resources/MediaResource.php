<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MediaResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'        => $this->id,
            'name'      => $this->name,
            'thumbnail' => $this->getUrl('thumbnail'),
            'card'      => $this->getUrl('card'),
            'full'      => $this->getUrl('full'),
            'original'  => $this->original_url,
            'size'      => $this->human_readable_size,
            'mime_type' => $this->mime_type,
        ];
    }
}
