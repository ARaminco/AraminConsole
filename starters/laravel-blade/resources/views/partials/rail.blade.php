<aside class="ac-rail" id="ac-rail" data-ac="rail" aria-label="{{ __('All pages') }}">
  <div class="ac-rail__head">
    <div class="ac-rail__heading"><span class="ac-rail__heading-text">{{ config('app.name') }}</span></div>
    <button class="ac-rail__close" type="button" data-ac-rail-close aria-label="{{ __('Close') }}"><svg class="ac-icon" aria-hidden="true"><use href="#i-x"/></svg></button>
  </div>
  <nav class="ac-rail__nav">
    <div class="ac-rail__group" data-group="main">
      <div class="ac-rail__label">{{ __('Main') }}</div>
      @foreach ([['dashboard', 'layout-dashboard', 'Dashboard'], ['users', 'users', 'Users']] as [$name, $icon, $label])
        <a class="ac-rail__link" href="{{ route($name) }}" @if (request()->routeIs($name)) aria-current="page" @endif>
          <svg class="ac-icon" aria-hidden="true"><use href="#i-{{ $icon }}"/></svg><span class="ac-rail__text">{{ __($label) }}</span>
        </a>
      @endforeach
    </div>
  </nav>
  <div class="ac-rail__foot">
    <a class="ac-powered ac-hide-mobile" href="https://air.co.ir/" target="_blank" rel="noopener">Powered by AIR</a>
  </div>
</aside>
