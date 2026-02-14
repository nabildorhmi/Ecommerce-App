<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    public function handle(Request $request, Closure $next): Response
    {
        $supported = ['fr', 'ar', 'en'];
        $locale = $request->getPreferredLanguage($supported) ?? config('app.locale');
        app()->setLocale($locale);
        return $next($request);
    }
}
