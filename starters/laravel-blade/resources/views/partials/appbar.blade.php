<header class="ac-appbar" data-ac="appbar" data-collapsed="true">
  <div class="ac-appbar__inner">
    <div class="ac-appbar__start">
      <a class="ac-chrome ac-brand" href="{{ route('dashboard') }}"><span class="ac-brand__name">{{ config('app.name') }}</span></a>
    </div>
    <div class="ac-appbar__center">
      <nav class="ac-chrome ac-topnav" data-ac="navpill" aria-label="Sections">
        <a class="ac-topnav__link" href="{{ route('dashboard') }}" @if (request()->routeIs('dashboard')) aria-current="page" @endif>{{ __('Dashboard') }}</a>
        <a class="ac-topnav__link" href="{{ route('users') }}" @if (request()->routeIs('users')) aria-current="page" @endif>{{ __('Users') }}</a>
      </nav>
    </div>
    <div class="ac-appbar__end">
      <button class="ac-iconbtn" type="button" data-action="theme" aria-label="Toggle theme" onclick="AC.theme.toggle()">
        <svg class="ac-icon ac-only-light" aria-hidden="true"><use href="#i-moon"/></svg>
        <svg class="ac-icon ac-only-dark" aria-hidden="true"><use href="#i-sun"/></svg>
      </button>
    </div>
  </div>
</header>
