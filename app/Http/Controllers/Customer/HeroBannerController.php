<?php

namespace App\Http\Controllers\Customer;

use App\Http\Controllers\Controller;
use App\Http\Resources\HeroBannerResource;
use App\Models\HeroBanner;
use Illuminate\Http\Resources\Json\ResourceCollection;

class HeroBannerController extends Controller
{
    /**
     * Public endpoint: return only active banners (ordered).
     */
    public function index(): ResourceCollection
    {
        $banners = HeroBanner::query()
            ->active()
            ->with('media')
            ->ordered()
            ->get();

        return HeroBannerResource::collection($banners);
    }
}
