# Starter: Laravel Blade

A layout, four partials, and two example pages. Drop `resources/views/*` into any Laravel 10+ app.

1. Copy AraminConsole into `public/vendor/aramin/`:
   ```bash
   cp -r /path/to/AraminConsole/dist/. public/vendor/aramin/
   ```
2. Copy `resources/views/layouts`, `partials`, `dashboard.blade.php`, `users.blade.php` into your `resources/views/`.
3. Add the two routes from `routes/web.php`.
4. Persian/Arabic: set `APP_LOCALE=fa`; the layout switches `lang` and `dir` for `fa` and `ar`.

Notes
- Pages `@extends('layouts.app')` and fill `@section('content')` with a `<section class="ac-page">`.
- Use `@push('scripts')` for page scripts; the shell does not need a Blade-aware build step.
- AJAX forms: the layout adds the CSRF header on `ac:form:submit`.
- The `.ac-powered` credit (https://air.co.ir/) lives in `partials/powered.blade.php` and the rail; remove or replace it freely (MIT).
