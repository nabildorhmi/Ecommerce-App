<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\UpdatePageRequest;
use App\Http\Resources\PageResource;
use App\Models\Page;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PageController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return PageResource::collection(Page::orderBy('title')->get());
    }

    public function update(UpdatePageRequest $request, Page $page): PageResource
    {
        $page->update($request->validated());

        return new PageResource($page);
    }
}
