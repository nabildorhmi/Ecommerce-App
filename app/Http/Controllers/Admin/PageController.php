<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePageRequest;
use App\Http\Requests\Admin\UpdatePageRequest;
use App\Http\Resources\PageResource;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PageController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return PageResource::collection(Page::orderBy('title')->get());
    }

    public function store(StorePageRequest $request): PageResource
    {
        $page = Page::create($request->validated());

        return new PageResource($page);
    }

    public function update(UpdatePageRequest $request, Page $page): PageResource
    {
        $page->update($request->validated());

        return new PageResource($page);
    }

    public function showSiteSettings(): PageResource
    {
        $page = Page::firstOrCreate(
            ['slug' => 'site-settings'],
            ['title' => 'Parametres du site', 'content' => '{}']
        );

        return new PageResource($page);
    }

    public function updateSiteSettings(Request $request): PageResource
    {
        $validated = $request->validate([
            'title' => 'sometimes|string|max:255',
            'content' => 'required|string',
        ]);

        $page = Page::firstOrCreate(
            ['slug' => 'site-settings'],
            ['title' => 'Parametres du site', 'content' => '{}']
        );

        $page->update([
            'title' => $validated['title'] ?? 'Parametres du site',
            'content' => $validated['content'],
        ]);

        return new PageResource($page);
    }
}
