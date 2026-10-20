<nav class="ac-tabbar" data-ac="tabbar" aria-label="Tabs">
  <a class="ac-tabbar__item" href="{{ route('dashboard') }}"><span class="ac-tabbar__icon"><svg class="ac-icon" aria-hidden="true"><use href="#i-house"/></svg></span><span class="ac-tabbar__label">{{ __('Home') }}</span></a>
  <a class="ac-tabbar__item" href="{{ route('users') }}"><span class="ac-tabbar__icon"><svg class="ac-icon" aria-hidden="true"><use href="#i-users"/></svg></span><span class="ac-tabbar__label">{{ __('Users') }}</span></a>
  <button class="ac-tabbar__item" type="button" data-ac-rail-open aria-controls="ac-rail"><span class="ac-tabbar__icon"><svg class="ac-icon" aria-hidden="true"><use href="#i-layout-grid"/></svg></span><span class="ac-tabbar__label">{{ __('More') }}</span></button>
</nav>
