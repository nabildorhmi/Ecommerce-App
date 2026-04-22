<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StorePageRequest;
use App\Http\Requests\Admin\UpdatePageRequest;
use App\Http\Resources\PageResource;
use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Str;

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
            'content' => 'required|string|json',
        ]);

        $page = Page::firstOrCreate(
            ['slug' => 'site-settings'],
            ['title' => 'Parametres du site', 'content' => '{}']
        );

        $previousDynamicSlugs = $this->extractDynamicPageSlugsFromContent($page->content);
        $dynamicPages = $this->extractDynamicPagesFromContent($validated['content']);

        $page->update([
            'title' => $validated['title'] ?? 'Parametres du site',
            'content' => $validated['content'],
        ]);

        $this->syncDynamicPages($dynamicPages, $previousDynamicSlugs);

        return new PageResource($page->fresh());
    }

    /**
     * @return array<string, string>
     */
    private function extractDynamicPagesFromContent(string $content): array
    {
        $settings = json_decode($content, true);
        $shortLinks = is_array($settings) ? ($settings['short_links'] ?? []) : [];

        if (!is_array($shortLinks)) {
            return [];
        }

        $dynamicPages = [];

        foreach ($shortLinks as $link) {
            if (!is_array($link)) {
                continue;
            }

            $url = isset($link['url']) && is_string($link['url']) ? trim($link['url']) : '';
            $label = isset($link['label']) && is_string($link['label']) ? trim($link['label']) : '';

            if (!preg_match('#^/pages/([a-z0-9-]+)$#i', $url, $matches)) {
                continue;
            }

            $slug = Str::lower($matches[1]);
            $title = $label !== '' ? $label : Str::title(str_replace('-', ' ', $slug));
            $dynamicPages[$slug] = $title;
        }

        return $dynamicPages;
    }

    /**
     * @return array<int, string>
     */
    private function extractDynamicPageSlugsFromContent(string $content): array
    {
        return array_keys($this->extractDynamicPagesFromContent($content));
    }

    /**
     * @param array<string, string> $dynamicPages
     * @param array<int, string> $previousDynamicSlugs
     */
    private function syncDynamicPages(array $dynamicPages, array $previousDynamicSlugs): void
    {
        foreach ($dynamicPages as $slug => $title) {
            Page::firstOrCreate(
                ['slug' => $slug],
                [
                    'title' => $title,
                    'content' => "# {$title}\n\nContenu a venir.",
                ]
            );
        }

        $currentDynamicSlugs = array_keys($dynamicPages);
        $removedDynamicSlugs = array_values(array_diff($previousDynamicSlugs, $currentDynamicSlugs));

        if (empty($removedDynamicSlugs)) {
            return;
        }

        Page::query()
            ->whereIn('slug', $removedDynamicSlugs)
            ->where('slug', '!=', 'site-settings')
            ->delete();
    }
}
