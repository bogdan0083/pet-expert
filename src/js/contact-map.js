ymaps.ready(initContactMap);

function initContactMap() {
  // Создание карты.
  var myMap = new ymaps.Map("contact-map", {
    // Координаты центра карты.
    // Порядок по умолчанию: «широта, долгота».
    // Чтобы не определять координаты центра карты вручную,
    // воспользуйтесь инструментом Определение координат.
    center: [55.386574, 36.728607],
    // Уровень масштабирования. Допустимые значения:
    // от 0 (весь мир) до 19.
    zoom: 7,
    controls: ['routeButtonControl'],
  });

  var myPlacemark = new ymaps.Placemark(myMap.getCenter(), {}, {
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
