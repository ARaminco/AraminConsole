<!doctype html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" dir="{{ in_array(app()->getLocale(), ['fa', 'ar']) ? 'rtl' : 'ltr' }}"
      data-ac-icons="{{ asset('vendor/aramin/icons.svg') }}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
  <meta name="csrf-token" content="{{ csrf_token() }}">
  <title>@yield('title', config('app.name'))</title>
  <script src="{{ asset('vendor/aramin/aramin-console-boot.js') }}"></script>
  <link rel="stylesheet" href="{{ asset('vendor/aramin/aramin-console.min.css') }}">
  <script type="module" src="{{ asset('vendor/aramin/aramin-console.min.js') }}"></script>
  @stack('head')
</head>
<body>
  <a class="ac-skip-link" href="#ac-content">{{ __('Skip to content') }}</a>
  <div class="ac-shell">
    @include('partials.appbar')
    @include('partials.rail')
    <div class="ac-scrim" data-ac-rail-close aria-hidden="true"></div>

    <div class="ac-main">
      <main class="ac-content" id="ac-content" tabindex="-1">
        @yield('content')
      </main>
      @include('partials.powered')
    </div>

    @include('partials.tabbar')
  </div>
  <div class="ac-toasts" id="ac-toasts" aria-live="polite"></div>

  @if (session('status'))
    <script type="module">
      document.addEventListener('DOMContentLoaded', () => AC.toast({ title: @json(session('status')), tone: 'success' }));
    </script>
  @endif
  {{-- Send CSRF with fetch/ajax submits of data-ac="form": --}}
  <script type="module">
    document.addEventListener('ac:form:submit', (e) => {
      e.detail.waitUntil(fetch(e.target.action, {
        method: 'POST',
        headers: { 'X-CSRF-TOKEN': document.querySelector('meta[name=csrf-token]').content, 'Accept': 'application/json' },
        body: e.detail.formData,
      }));
    });
  </script>
  @stack('scripts')
</body>
</html>
