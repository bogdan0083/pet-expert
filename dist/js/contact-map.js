ymaps.ready(initContactMap);

function initContactMap() {

  var SCREEN_UP_LG = '(min-width: 992px)';
  var SCREEN_DOWN_LG = '(max-width: 992px)';
  var SCREEN_UP_MD = '(min-width: 768px)';
  var SCREEN_DOWN_MD = '(max-width: 768px)';

  var isTablet = window.matchMedia(SCREEN_DOWN_LG).matches && window.matchMedia(SCREEN_UP_MD).matches;
  var isMobile = window.matchMedia(SCREEN_DOWN_MD).matches;

  var mapCenter = [55.386574, 36.728607];
  var markerCenter = [55.386574, 36.728607];

  if (isTablet || isMobile) {
    mapCenter[0] -= 0.5
  }
  // Создание карты.
  var myMap = new ymaps.Map("contact-map", {
    // Координаты центра карты.
    // Порядок по умолчанию: «широта, долгота».
    // Чтобы не определять координаты центра карты вручную,
    // воспользуйтесь инструментом Определение координат.
    center: mapCenter,
    controls: [],
    // Уровень масштабирования. Допустимые значения:
    // от 0 (весь мир) до 19.
    zoom: 7,
  });

  var myPlacemark = new ymaps.Placemark(markerCenter, {}, {
    // Опции.
    // Необходимо указать данный тип макета.
    iconLayout: 'default#image',
    // Своё изображение иконки метки.
    iconImageHref: 'img/map-marker.svg',
    // Размеры метки.
    iconImageSize: [40, 55],
    // Смещение левого верхнего угла иконки относительно
    // её "ножки" (точки привязки).
    iconImageOffset: [-40, -55]
  });

  myMap.geoObjects
    .add(myPlacemark);

  var contactTabs = document.querySelectorAll('.js-contact-tab');

  if (contactTabs) {
    contactTabs.forEach(function (tab) {
      tab.addEventListener('click', onContactTabClick);
    });

    function onContactTabClick(e) {
      e.preventDefault();
      var coordsString = this.dataset.coords;
      var yandexRouteUrl = this.dataset.routeYandex;
      var googleRouteUrl = this.dataset.routeGoogle;
      var gisRouteUrl = this.dataset['route-2gis'];

      if (coordsString) {
        var coordsArray = coordsString.split(',');
        myMap.setCenter(coordsArray);
        myPlacemark.geometry.setCoordinates(coordsArray);
      }

      if (yandexRouteUrl) {
        var routeLinkElem = document.querySelector('.js-route-yandex');
        routeLinkElem.setAttribute('href', yandexRouteUrl);
      }

      if (googleRouteUrl) {
        var routeLinkElem = document.querySelector('.js-route-google');
        routeLinkElem.setAttribute('href', googleRouteUrl);
      }

      if (gisRouteUrl) {
        var routeLinkElem = document.querySelector('.js-route-2gis');
        routeLinkElem.setAttribute('href', gisRouteUrl);
      }
    }
  }
}
