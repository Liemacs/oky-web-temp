/* OKI WAY · page behaviour: navigation, menus, forms, FAQ, routes grid, airports popup, glass buttons */
(function(){
"use strict";
var RM=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
var $=function(s,r){return (r||document).querySelector(s)};
function ico(d){return '<svg viewBox="0 0 24 24" fill="none" aria-hidden="true">'+d+'</svg>'}   /* glyphs: refs icon library (reicon) */
var IC={
  send:ico("<path d=\"M9.03023 21.6898L11.3602 19.7298C11.7102 19.4298 12.2902 19.4298 12.6402 19.7298L14.9702 21.6898C15.5102 21.9598 16.1702 21.6898 16.3702 21.1098L16.8102 19.7798C16.9202 19.4598 16.8102 18.9898 16.5702 18.7498L14.3002 16.4698C14.1302 16.3098 14.0002 15.9898 14.0002 15.7598V12.9098C14.0002 12.4898 14.3102 12.2898 14.7002 12.4498L19.6102 14.5698C20.3802 14.8998 21.0102 14.4898 21.0102 13.6498V12.3598C21.0102 11.6898 20.5102 10.9198 19.8902 10.6598L14.3002 8.24977C14.1402 8.17977 14.0002 7.96977 14.0002 7.78977V4.78977C14.0002 3.84977 13.3102 2.73977 12.4702 2.30977C12.1702 2.15977 11.8202 2.15977 11.5202 2.30977C10.6802 2.73977 9.99023 3.85977 9.99023 4.79977V7.79977C9.99023 7.97977 9.85023 8.18977 9.69023 8.25977L4.11023 10.6698C3.49023 10.9198 2.99023 11.6898 2.99023 12.3598V13.6498C2.99023 14.4898 3.62023 14.8998 4.39023 14.5698L9.30023 12.4498C9.68023 12.2798 10.0002 12.4898 10.0002 12.9098V15.7598C10.0002 15.9898 9.87023 16.3098 9.71023 16.4698L7.44023 18.7498C7.20023 18.9898 7.09023 19.4498 7.20023 19.7798L7.64023 21.1098C7.82023 21.6898 8.48023 21.9698 9.03023 21.6898Z\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"),
  box:ico("<path d=\"M6 16.25C5.58579 16.25 5.25 16.5858 5.25 17C5.25 17.4142 5.58579 17.75 6 17.75H9C9.41421 17.75 9.75 17.4142 9.75 17C9.75 16.5858 9.41421 16.25 9 16.25H6Z\" fill=\"currentColor\"/> <path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M7.04508 1.25H16.9549C18.1859 1.25 19.3113 1.94551 19.8618 3.04656L22.5125 8.34787C22.6687 8.6603 22.75 9.0048 22.75 9.3541V19C22.75 21.0711 21.0711 22.75 19 22.75H5C2.92893 22.75 1.25 21.0711 1.25 19V9.3541C1.25 9.0048 1.33133 8.6603 1.48754 8.34787L4.1382 3.04656C4.68872 1.94551 5.81408 1.25 7.04508 1.25ZM5.47984 3.71738C5.77627 3.1245 6.38223 2.75 7.04508 2.75H11.25V8.25H3.21353L5.47984 3.71738ZM12.75 8.25V2.75H16.9549C17.6178 2.75 18.2237 3.1245 18.5202 3.71738L20.7865 8.25H12.75ZM2.75 9.75H21.25V19C21.25 20.2426 20.2426 21.25 19 21.25H5C3.75736 21.25 2.75 20.2426 2.75 19V9.75Z\" fill=\"currentColor\"/>"),
  doc:ico("<path d=\"M9.31 14.7L10.81 16.2L14.81 12.2\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M10 6H14C16 6 16 5 16 4C16 2 15 2 14 2H10C9 2 8 2 8 4C8 6 9 6 10 6Z\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-miterlimit=\"10\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M16 4.02002C19.33 4.20002 21 5.43002 21 10V16C21 20 20 22 15 22H9C4 22 3 20 3 16V10C3 5.44002 4.67 4.20002 8 4.02002\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-miterlimit=\"10\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"),
  temp:ico("<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M8.25 5C8.25 2.92893 9.92893 1.25 12 1.25C14.0711 1.25 15.75 2.92893 15.75 5V11.3477C15.75 11.42 15.7896 11.5273 15.9078 11.6221C17.3345 12.7663 18.25 14.5265 18.25 16.5C18.25 19.9518 15.4518 22.75 12 22.75C8.54822 22.75 5.75 19.9518 5.75 16.5C5.75 14.5265 6.66555 12.7663 8.09215 11.6221C8.21038 11.5273 8.25 11.42 8.25 11.3477V5ZM12 2.75C10.7574 2.75 9.75 3.75736 9.75 5V11.3477C9.75 11.9513 9.43973 12.4642 9.03066 12.7923C7.94374 13.664 7.25 15.0007 7.25 16.5C7.25 19.1234 9.37665 21.25 12 21.25C14.6234 21.25 16.75 19.1234 16.75 16.5C16.75 15.0007 16.0563 13.664 14.9693 12.7923C14.5603 12.4642 14.25 11.9513 14.25 11.3477V5C14.25 3.75736 13.2426 2.75 12 2.75ZM12 4.25C12.4142 4.25001 12.75 4.58581 12.75 5.00002L12.7498 13.3369C14.1831 13.6754 15.2498 14.9631 15.2498 16.4999C15.2498 18.2948 13.7947 19.7499 11.9998 19.7499C10.2048 19.7499 8.74977 18.2948 8.74977 16.4999C8.74977 14.9631 9.81643 13.6754 11.2498 13.3368L11.25 4.99998C11.25 4.58577 11.5858 4.24999 12 4.25ZM11.9998 14.7499C11.0333 14.7499 10.2498 15.5334 10.2498 16.4999C10.2498 17.4664 11.0333 18.2499 11.9998 18.2499C12.9663 18.2499 13.7498 17.4664 13.7498 16.4999C13.7498 15.5334 12.9663 14.7499 11.9998 14.7499Z\" fill=\"currentColor\"/>"),
  max:ico("<path d=\"M16.1429 1.25C15.7286 1.25 15.3929 1.58579 15.3929 2C15.3929 2.41421 15.7286 2.75 16.1429 2.75H20.1893L14.4697 8.46967C14.1768 8.76256 14.1768 9.23744 14.4697 9.53033C14.7626 9.82322 15.2374 9.82322 15.5303 9.53033L21.25 3.81066V7.85714C21.25 8.27136 21.5858 8.60714 22 8.60714C22.4142 8.60714 22.75 8.27136 22.75 7.85714V2C22.75 1.58579 22.4142 1.25 22 1.25H16.1429Z\" fill=\"currentColor\"/><path d=\"M7.85714 22.75C8.27136 22.75 8.60714 22.4142 8.60714 22C8.60714 21.5858 8.27136 21.25 7.85714 21.25H3.81066L9.53033 15.5303C9.82322 15.2374 9.82322 14.7626 9.53033 14.4697C9.23744 14.1768 8.76256 14.1768 8.46967 14.4697L2.75 20.1893V16.1429C2.75 15.7286 2.41421 15.3929 2 15.3929C1.58579 15.3929 1.25 15.7286 1.25 16.1429V22C1.25 22.4142 1.58579 22.75 2 22.75H7.85714Z\" fill=\"currentColor\"/>"),
  route:ico("<path d=\"M19.5 17.5C19.5 18.0523 19.0523 18.5 18.5 18.5C17.9477 18.5 17.5 18.0523 17.5 17.5C17.5 16.9477 17.9477 16.5 18.5 16.5C19.0523 16.5 19.5 16.9477 19.5 17.5Z\" fill=\"currentColor\"/><path d=\"M6.5 5.5C6.5 6.05228 6.05228 6.5 5.5 6.5C4.94772 6.5 4.5 6.05228 4.5 5.5C4.5 4.94772 4.94772 4.5 5.5 4.5C6.05228 4.5 6.5 4.94772 6.5 5.5Z\" fill=\"currentColor\"/><path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M1.25 5.25732C1.25 2.99429 3.20446 1.25 5.5 1.25C7.79554 1.25 9.75 2.99429 9.75 5.25732C9.75 7.28359 8.50419 9.67508 6.43476 10.5594C5.84021 10.8135 5.15979 10.8135 4.56524 10.5594C2.49581 9.67508 1.25 7.28359 1.25 5.25732ZM5.5 2.75C3.92955 2.75 2.75 3.92241 2.75 5.25732C2.75 6.80078 3.73835 8.57485 5.15469 9.18011C5.37274 9.2733 5.62726 9.2733 5.84531 9.18011C7.26165 8.57485 8.25 6.80078 8.25 5.25732C8.25 3.92241 7.07045 2.75 5.5 2.75ZM11.25 5C11.25 4.58579 11.5858 4.25 12 4.25H16.1319C18.8831 4.25 19.9294 7.843 17.6083 9.32007L7.19703 15.9454C6.14197 16.6168 6.61756 18.25 7.86812 18.25H10.1893L9.96967 18.0303C9.67678 17.7374 9.67678 17.2626 9.96967 16.9697C10.2626 16.6768 10.7374 16.6768 11.0303 16.9697L12.5303 18.4697C12.8232 18.7626 12.8232 19.2374 12.5303 19.5303L11.0303 21.0303C10.7374 21.3232 10.2626 21.3232 9.96967 21.0303C9.67678 20.7374 9.67678 20.2626 9.96967 19.9697L10.1893 19.75H7.86812C5.11688 19.75 4.07062 16.157 6.39172 14.6799L16.803 8.05458C17.858 7.38318 17.3824 5.75 16.1319 5.75H12C11.5858 5.75 11.25 5.41421 11.25 5ZM14.25 17.2573C14.25 14.9943 16.2045 13.25 18.5 13.25C20.7955 13.25 22.75 14.9943 22.75 17.2573C22.75 19.2836 21.5042 21.6751 19.4348 22.5594C18.8402 22.8135 18.1598 22.8135 17.5652 22.5594C15.4958 21.6751 14.25 19.2836 14.25 17.2573ZM18.5 14.75C16.9295 14.75 15.75 15.9224 15.75 17.2573C15.75 18.8008 16.7384 20.5748 18.1547 21.1801C18.3727 21.2733 18.6273 21.2733 18.8453 21.1801C20.2617 20.5748 21.25 18.8008 21.25 17.2573C21.25 15.9224 20.0705 14.75 18.5 14.75Z\" fill=\"currentColor\"/>"),
  bolt:ico("<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M9.25 2C9.25 1.58579 9.58579 1.25 10 1.25H14C14.4142 1.25 14.75 1.58579 14.75 2C14.75 2.41421 14.4142 2.75 14 2.75H10C9.58579 2.75 9.25 2.41421 9.25 2ZM12 4.75C7.44365 4.75 3.75 8.44365 3.75 13C3.75 17.5564 7.44365 21.25 12 21.25C16.5563 21.25 20.25 17.5564 20.25 13C20.25 8.44365 16.5563 4.75 12 4.75ZM2.25 13C2.25 7.61522 6.61522 3.25 12 3.25C17.3848 3.25 21.75 7.61522 21.75 13C21.75 18.3848 17.3848 22.75 12 22.75C6.61522 22.75 2.25 18.3848 2.25 13ZM12 8.25C12.4142 8.25 12.75 8.58579 12.75 9V13C12.75 13.4142 12.4142 13.75 12 13.75C11.5858 13.75 11.25 13.4142 11.25 13V9C11.25 8.58579 11.5858 8.25 12 8.25Z\" fill=\"currentColor\"/>"),
  shield:ico("<path d=\"M10.49 2.23006L5.50003 4.11006C4.35003 4.54006 3.41003 5.90006 3.41003 7.12006V14.5501C3.41003 15.7301 4.19003 17.2801 5.14003 17.9901L9.44003 21.2001C10.85 22.2601 13.17 22.2601 14.58 21.2001L18.88 17.9901C19.83 17.2801 20.61 15.7301 20.61 14.5501V7.12006C20.61 5.89006 19.67 4.53006 18.52 4.10006L13.53 2.23006C12.68 1.92006 11.32 1.92006 10.49 2.23006Z\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M9.05005 11.8701L10.66 13.4801L14.96 9.18005\" stroke=\"currentColor\" stroke-width=\"1.5\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>"),
  globe:ico("<path fill-rule=\"evenodd\" clip-rule=\"evenodd\" d=\"M9.20646 3.18191C8.95433 3.26179 8.70533 3.35257 8.46018 3.45411C7.33792 3.91897 6.3182 4.60032 5.45926 5.45926C4.60032 6.3182 3.91897 7.33792 3.45411 8.46018C3.0852 9.35081 2.85837 10.2922 2.78045 11.25H7.26094C7.29294 10.1541 7.39498 9.0741 7.56457 8.05057C7.7725 6.79558 8.07972 5.63914 8.47522 4.65039C8.69114 4.11057 8.9351 3.61641 9.20646 3.18191ZM12 1.25C10.5883 1.25 9.1904 1.52806 7.88615 2.06829C6.5819 2.60853 5.39683 3.40037 4.3986 4.3986C3.40037 5.39683 2.60853 6.5819 2.0683 7.88615C1.52806 9.1904 1.25 10.5883 1.25 12C1.25 13.4117 1.52806 14.8096 2.06829 16.1138C2.60853 17.4181 3.40037 18.6032 4.3986 19.6014C5.39683 20.5996 6.5819 21.3915 7.88615 21.9317C9.1904 22.4719 10.5883 22.75 12 22.75C13.4117 22.75 14.8096 22.4719 16.1138 21.9317C17.4181 21.3915 18.6032 20.5996 19.6014 19.6014C20.5996 18.6032 21.3915 17.4181 21.9317 16.1138C22.4719 14.8096 22.75 13.4117 22.75 12C22.75 10.5883 22.4719 9.1904 21.9317 7.88615C21.3915 6.5819 20.5996 5.39683 19.6014 4.3986C18.6032 3.40037 17.4181 2.60853 16.1138 2.0683C14.8096 1.52806 13.4117 1.25 12 1.25ZM12 2.75C11.7387 2.75 11.4012 2.87579 11.0088 3.2822C10.6134 3.69161 10.2176 4.33326 9.86793 5.20747C9.52056 6.07589 9.2385 7.12424 9.04439 8.29576C8.88866 9.23569 8.79316 10.2331 8.76162 11.25L15.2384 11.25C15.2068 10.2331 15.1113 9.23569 14.9556 8.29576C14.7615 7.12424 14.4794 6.0759 14.1321 5.20748C13.7824 4.33326 13.3866 3.69161 12.9912 3.2822C12.5988 2.87579 12.2613 2.75 12 2.75ZM16.7391 11.25C16.7071 10.1541 16.605 9.07411 16.4354 8.05057C16.2275 6.79558 15.9203 5.63914 15.5248 4.65039C15.3089 4.11057 15.0649 3.61641 14.7935 3.18191C15.0457 3.26179 15.2947 3.35257 15.5398 3.45411C16.6621 3.91897 17.6818 4.60032 18.5407 5.45926C19.3997 6.31821 20.081 7.33792 20.5459 8.46018C20.9148 9.35082 21.1416 10.2922 21.2195 11.25H16.7391ZM15.2384 12.75L8.76162 12.75C8.79316 13.7669 8.88866 14.7643 9.04439 15.7042C9.2385 16.8758 9.52056 17.9241 9.86793 18.7925C10.2176 19.6667 10.6134 20.3084 11.0088 20.7178C11.4012 21.1242 11.7387 21.25 12 21.25C12.2613 21.25 12.5988 21.1242 12.9912 20.7178C13.3866 20.3084 13.7824 19.6667 14.1321 18.7925C14.4794 17.9241 14.7615 16.8758 14.9556 15.7042C15.1113 14.7643 15.2068 13.7669 15.2384 12.75ZM14.7935 20.8181C15.0649 20.3836 15.3089 19.8894 15.5248 19.3496C15.9203 18.3609 16.2275 17.2044 16.4354 15.9494C16.605 14.9259 16.7071 13.8459 16.7391 12.75H21.2195C21.1416 13.7078 20.9148 14.6492 20.5459 15.5398C20.081 16.6621 19.3997 17.6818 18.5407 18.5407C17.6818 19.3997 16.6621 20.081 15.5398 20.5459C15.2947 20.6474 15.0457 20.7382 14.7935 20.8181ZM9.20646 20.8181C8.9351 20.3836 8.69114 19.8894 8.47521 19.3496C8.07971 18.3609 7.7725 17.2044 7.56457 15.9494C7.39498 14.9259 7.29294 13.8459 7.26094 12.75H2.78045C2.85837 13.7078 3.0852 14.6492 3.45411 15.5398C3.91897 16.6621 4.60032 17.6818 5.45926 18.5407C6.3182 19.3997 7.33792 20.081 8.46018 20.5459C8.70533 20.6474 8.95433 20.7382 9.20646 20.8181Z\" fill=\"currentColor\"/>"),
  user:ico("<path d=\"M 17.3333 17.6666 l -0.456 1.9293 c -0.2773 1.212 -1.356 2.0707 -2.5987 2.0707 h -2.612\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"></path><path d=\"M 5 9.804 l -1.4973 0.756 c -1.084 0.548 -1.6613 1.7587 -1.404 2.9453 l 0.4467 2.06 c 0.2653 1.2267 1.3507 2.1013 2.6067 2.1013 h 1.516 s -1.4453 -6.6666 -1.4453 -6.6666 c -0.132 -0.5373 -0.2213 -1.0893 -0.2213 -1.6667 0 -3.8653 3.1347 -7 7 -7 s 7 3.1347 7 7 c 0 0.5773 -0.0893 1.1293 -0.2213 1.6667 l -1.4453 6.6666 h 1.516 c 1.2547 0 2.34 -0.8747 2.6067 -2.1013 l 0.4467 -2.06 c 0.2573 -1.1867 -0.32 -2.3987 -1.404 -2.9453 l -1.4973 -0.756\" fill=\"none\" stroke=\"currentColor\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"1.5\"></path>")
};

/* ---------------- content (all of it from okiway.md) ---------------- */
var SERVICES=[
  ['send','Express air freight','Delivery in 24–48 h on direct flights and global connections. For high-value or time-critical cargo.'],
  ['box','Standard cargo','Economy rates for large volumes. We consolidate your cargo and ship it on scheduled routes with daily flights.'],
  ['doc','Full customs clearance','We handle the paperwork, declarations and classification, so your cargo crosses the border without delays.'],
  ['temp','Perishable & special cargo','Pharmaceuticals, medical supplies and food, carried under controlled conditions with continuous temperature monitoring.'],
  ['max','Oversized cargo','Industrial machinery and large components, loaded straight through the aircraft’s swing-up nose.'],
  ['route','Cargo charters','A route and schedule set just for you, with constant monitoring throughout the flight.']
];
var FLEET=[
  ['Boeing 747-8F','4K-BCG','assets/img/a747.jpg','Nose loading for oversized cargo',[['140 t','Payload'],['8,130 km','Range'],['858 m³','Volume'],['988 km/h','Speed']]],
  ['Boeing 777F','4K-SW888','assets/img/a777.jpg','The longest range in the fleet',[['103 t','Payload'],['9,200 km','Range'],['653 m³','Volume'],['905 km/h','Speed']]]
];
var ROUTES=[
  ['East Asia','China, Japan and South Korea','HKG / PVG / CAN',7,'assets/img/shanghai.jpg','Shanghai'],
  ['Western & Northern Europe','Germany, UK, Belgium, Italy, Spain','FRA / HAM / BER',16,'assets/img/paris.jpg','Western Europe'],
  ['West Asia','Türkiye, UAE, Israel and Iraq','IST / KWI / BGW',8,'assets/img/dubai.jpg','Dubai'],
  ['Eastern Europe','Moldova, Romania, Bulgaria and the Baltics','TBS / GYD / RMO',7,'assets/img/tallinn.jpg','Tallinn'],
  ['Central Asia','Kazakhstan, Kyrgyzstan, Turkmenistan, Uzbekistan','ALA / FRU / ASB',6,'assets/img/registan.jpg','Samarkand'],
  ['South & Southeast Asia','India, Malaysia and Singapore','SIN / BOM / KUL',5,'assets/img/india.jpg','India'],
  ['North America','USA, Canada and Mexico','EWR / DEN / AUS',11,'assets/img/newyork.jpg','New York'],
  ['South America','Argentina and Chile','SCL / EZE',2,'assets/img/santiago.jpg','Santiago']
];
/* departure airports per region (same order as ROUTES), from the airports popup on okiway.md */
var AIRPORTS=[[["HKG","Hong Kong International Airport","Hong Kong"],["CAN","Guangzhou Baiyun International Airport","Guangzhou, China"],["PVG","Shanghai Pudong International Airport","Shanghai, China"],["PEK","Beijing Capital International Airport","Beijing, China"],["CGO","Zhengzhou Xinzheng Airport","Zhengzhou, China"],["NRT","Narita International Airport","Tokyo, Japan"],["ICN","Incheon International Airport","Seoul, South Korea"]],[["HAM","Hamburg Airport","Hamburg, Germany"],["HHN","Frankfurt-Hahn Airport","Frankfurt, Germany"],["BER","Berlin Brandenburg Airport","Berlin, Germany"],["MUC","Munich International Airport","Munich, Germany"],["LUX","Findel International Airport","Luxembourg"],["LGG","Liège Airport","Liège, Belgium"],["VIE","Vienna International Airport","Vienna, Austria"],["AMS","Amsterdam Schiphol Airport","Amsterdam, Netherlands"],["MST","Maastricht Aachen Airport","Maastricht, Netherlands"],["NCL","Newcastle International Airport","Newcastle, England"],["LHR/STN/BHX","London Heathrow / Stansted / Birmingham","London, United Kingdom"],["BFS","Belfast International Airport","Belfast, Northern Ireland"],["BSL","Euro Airport Basel-Mulhouse-Freiburg","Basel, France"],["MXP","Malpensa International Airport","Milan, Italy"],["MAD","Adolfo Suárez Madrid–Barajas Airport","Madrid, Spain"],["OSL","Oslo Airport","Oslo, Norway"]],[["IST","Istanbul Airport","Istanbul, Türkiye"],["KWI","Kuwait International Airport","Kuwait"],["BGW","Baghdad International Airport","Baghdad, Iraq"],["EBL","Erbil International Airport","Erbil, Iraq"],["BSR","Basra International Airport","Basra, Iraq"],["TLV","Ben Gurion International Airport","Tel Aviv, Israel"],["SHJ","Sharjah International Airport","Sharjah, UAE"],["DWC","Al Maktoum International Airport","Dubai, UAE"]],[["TBS","Tbilisi International Airport","Tbilisi, Georgia"],["GYD","Heydar Aliyev International Airport","Baku, Azerbaijan"],["RMO","Chișinău International Airport","Chișinău, Moldova"],["OTP","Henri Coandă International Airport","Bucharest, Romania"],["SOF","Sofia International Airport","Sofia, Bulgaria"],["PRG","Václav Havel Airport Prague","Prague, Czechia"],["VNO","Vilnius International Airport","Vilnius, Lithuania"]],[["FRU","Manas International Airport","Bishkek, Kyrgyzstan"],["ASB","Ashgabat Airport","Ashgabat, Turkmenistan"],["ALA","Almaty Airport","Almaty, Kazakhstan"],["SCO","Aktau Airport","Aktau, Kazakhstan"],["TAS","Tashkent International Airport","Tashkent, Uzbekistan"],["GUW","Atyrau Airport","Atyrau, Kazakhstan"]],[["KUL","Kuala Lumpur International Airport","Kuala Lumpur, Malaysia"],["SIN","Singapore Changi International Airport","Singapore"],["BOM","Chhatrapati Shivaji Maharaj Intl Airport","Mumbai, India"],["AMD","Sardar Vallabhbhai Patel Intl Airport","Ahmedabad, India"],["CCU","Netaji Subhash Chandra Bose Intl Airport","Kolkata, India"]],[["AUS","Austin-Bergstrom International Airport","Austin, USA"],["DEN","Denver International Airport","Denver, USA"],["EWR","Newark Liberty International Airport","Newark, USA"],["IAD","Dulles International Airport","Washington, USA"],["ATL","Hartsfield-Jackson Atlanta Intl Airport","Atlanta, USA"],["MIA","Miami International Airport","Miami, USA"],["ORD","O'Hare International Airport","Chicago, USA"],["IAH","George Bush Intercontinental Airport","Houston, USA"],["JFK","John F. Kennedy International Airport","New York, USA"],["MEX","Benito Juárez International Airport","Mexico City, Mexico"],["YYZ","Toronto Pearson International Airport","Toronto, Canada"]],[["SCL","Arturo Merino Benítez International Airport","Santiago, Chile"],["EZE","Ministro Pistarini International Airport","Buenos Aires, Argentina"]]];
var STEPS=[
  ['Request a quote','Fill in the form or call us. You get a final quote with the full price and no hidden costs.'],
  ['We plan the route','We choose the fastest, most cost-effective route, then prepare the import documents and customs formalities.'],
  ['We collect and load','We pick up your cargo, pack it to IATA standards and get it ready for loading onto the aircraft.'],
  ['We deliver and confirm','Your cargo reaches its destination. You receive the confirmation, the import documents and a shipment report.']
];
var WHY=[
  ['bolt','The fastest slot','350+ flights a month. We find the fastest slot for your cargo, whatever the destination or volume.'],
  ['shield','IATA-certified security','Full security procedures, cargo insurance and GPS tracking on every shipment.'],
  ['globe','Global network','60+ destinations across Europe, Asia, the US and the Middle East, with direct links to Moldova.'],
  ['user','Personal manager 24/7','One dedicated person you can reach any time. You talk directly to whoever is responsible for your shipment, not to an automated system.']
];
var FAQ=[
  ['How long does shipping to Chișinău take?','With our express service, 24–48 h on direct flights and global connections. Standard cargo travels on scheduled routes with daily flights. You get the exact transit time for your route together with the quote.'],
  ['Do you handle customs clearance too?','Yes. We manage the entire customs process: the paperwork, declarations and cargo classification. At the end you receive the import documents and a shipment report.'],
  ['How is the price calculated?','The price depends on the route, weight, volume and type of cargo. Send us these details and you get a free final quote with the full price and no hidden costs.'],
  ['Do you carry pharmaceuticals or perishables?','Yes. Pharmaceuticals, medical supplies and food fly under controlled conditions with continuous temperature monitoring.'],
  ['What about oversized cargo?','Industrial machinery and large components are loaded straight through the aircraft’s swing-up nose. Tell us the dimensions and weight, and we will find the right route.'],
  ['Who do I talk to if something goes wrong?','Your personal manager. They can be reached any time in an emergency, and you speak directly with the person responsible for your shipment.']
];

/* ---------------- render (stagger: 50ms inside a group) ---------------- */
$('#svc').innerHTML=SERVICES.map(function(s,i){
  return '<article class="card svc" data-a style="--d:'+(i%3)*50+'ms"><span class="ic">'+IC[s[0]]+'</span><h3>'+s[1]+'</h3><p>'+s[2]+'</p>'+
    '</article>';
}).join('');
$('#fleet').innerHTML=FLEET.map(function(f,i){
  return '<article class="card ac" data-a style="--d:'+i*50+'ms"><div class="ph"><img src="'+f[2]+'" alt="'+f[0]+' Silk Way West, registration '+f[1]+'" loading="lazy"><span class="tagr">'+f[1]+'</span></div>'+
    '<div class="bd"><div class="row"><h3 style="font-size:1.5rem">'+f[0]+'</h3><span>'+f[3]+'</span></div>'+
    '<div class="specs">'+f[4].map(function(s){return '<div><b>'+s[0]+'</b><span class="cap">'+s[1]+'</span></div>'}).join('')+'</div></div></article>';
}).join('');
/* routes grid: Chișinău in the centre, each region placed roughly in its direction from Moldova (-1 = Chișinău) */
var GRID=[6,3,4, 1,-1,0, 7,2,5];
$('#rgrid').innerHTML=GRID.map(function(k){
  var r=k<0?['Chișinău','Where every route lands, customs clearance included','RMO','International Airport','assets/img/chisinau.jpg']:[ROUTES[k][0],ROUTES[k][1],ROUTES[k][2],ROUTES[k][3]+' airports',ROUTES[k][4]];
  return '<button type="button" class="rt'+(k<0?' kiv':'')+'" data-k="'+k+'"'+(k<0?'':' aria-haspopup="dialog"')+'><img src="'+r[4]+'" alt="" loading="lazy" decoding="async">'+
    '<span class="rt-cap"><b>'+r[0]+'</b><span class="rt-cn">'+r[1]+'</span><span class="rt-cd">'+r[2]+'<em>'+r[3]+'</em></span>'+
    '<span class="rt-go">'+(k<0?'Get a quote':'View airports')+'<svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15.2929 7.70711C14.9024 7.31658 14.9024 6.68342 15.2929 6.29289C15.6834 5.90237 16.3166 5.90237 16.7071 6.29289L21.7071 11.2929C22.0976 11.6834 22.0976 12.3166 21.7071 12.7071L16.7071 17.7071C16.3166 18.0976 15.6834 18.0976 15.2929 17.7071C14.9024 17.3166 14.9024 16.6834 15.2929 16.2929L18.5858 13H3C2.44772 13 2 12.5523 2 12C2 11.4477 2.44772 11 3 11H18.5858L15.2929 7.70711Z" fill="currentColor"/></svg></span></span></button>';
}).join('');
$('#flow').innerHTML=STEPS.map(function(s,i){
  return '<article class="st" data-a style="--d:'+i*50+'ms"><div class="top"><span class="k">'+(i+1)+'</span></div>'+
    '<div class="pv" aria-hidden="true"><canvas></canvas></div><h3>'+s[0]+'</h3><p>'+s[1]+'</p></article>';
}).join('');
$('#why').innerHTML=WHY.map(function(w,i){
  return '<div class="adv" data-a style="--d:'+i*50+'ms"><span class="ic">'+IC[w[0]]+'</span><h3>'+w[1]+'</h3><p>'+w[2]+'</p></div>';
}).join('');
$('#qa').innerHTML=FAQ.map(function(f,i){
  return '<details'+(i===0?' open':'')+' data-a style="--d:'+i*50+'ms"><summary>'+f[0]+'<span class="pm" aria-hidden="true"><svg class="pl" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M11 20C11 20.5523 11.4477 21 12 21C12.5523 21 13 20.5523 13 20V13H20C20.5523 13 21 12.5523 21 12C21 11.4477 20.5523 11 20 11H13V4C13 3.44771 12.5523 3 12 3C11.4477 3 11 3.44771 11 4V11H4C3.44771 11 3 11.4477 3 12C3 12.5523 3.44771 13 4 13H11V20Z" fill="currentColor"/></svg><svg class="mi" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21 12C21 12.5523 20.5523 13 20 13H4C3.44771 13 3 12.5523 3 12C3 11.4477 3.44771 11 4 11H20C20.5523 11 21 11.4477 21 12Z" fill="currentColor"/></svg></span></summary><p class="ans">'+f[1]+'</p></details>';
}).join('');


/* FAQ: smooth open/close. The whole <details> height is animated, so the answer's padding and the
   divider glide together; the icon flips as soon as the click lands. Reduced motion keeps the native toggle. */
(function(){
  var qa=document.getElementById('qa'); if(!qa||!Element.prototype.animate) return;
  var mq=window.matchMedia?matchMedia('(prefers-reduced-motion: reduce)'):null, EASE='cubic-bezier(.215,.61,.355,1)';
  [].forEach.call(qa.querySelectorAll('details'),function(d){
    var s=d.querySelector('summary'),a=d.querySelector('.ans'),hA=null,fA=null;
    function shut(){var cs=getComputedStyle(d);return s.offsetHeight+parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom)+parseFloat(cs.borderTopWidth)+parseFloat(cs.borderBottomWidth)}
    s.addEventListener('click',function(e){
      if(mq&&mq.matches) return;
      e.preventDefault();
      var opening=!d.open||d.classList.contains('closing'), mid=!!hA, from=d.offsetHeight,
          op=mid?+getComputedStyle(a).opacity:(opening?0:1), to;
      if(hA){hA.onfinish=null;hA.cancel();hA=null} if(fA){fA.cancel();fA=null}
      if(opening){d.classList.remove('closing');d.open=true;to=d.offsetHeight}
      else{d.classList.add('closing');to=shut()}
      var dist=Math.abs(to-from);
      if(dist<1){if(!opening){d.open=false;d.classList.remove('closing')}d.style.overflow='';return}
      var dur=Math.round(Math.min(600,300+dist*1.2)*(opening?1:.85));
      d.style.overflow='hidden';
      hA=d.animate({height:[from+'px',to+'px']},{duration:dur,easing:EASE});
      fA=a.animate(opening?{opacity:[op,1],transform:[mid?'none':'translateY(-6px)','none']}
                          :{opacity:[op,0],transform:['none','translateY(-4px)']},
                   {duration:opening?dur:Math.round(dur*.6),easing:EASE,fill:'both'});
      hA.onfinish=function(){
        hA=null; if(fA){fA.cancel();fA=null}
        if(!opening){d.open=false;d.classList.remove('closing')}
        d.style.overflow='';
      };
    });
  });
})();

/* ---------------- blur-in below the hero: plays once as a block nears the viewport ---------------- */
var io=new IntersectionObserver(function(es){es.forEach(function(e){
  if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}
})},{rootMargin:'0px 0px 12% 0px',threshold:0});
document.querySelectorAll('[data-a]').forEach(function(el){ if(!el.closest('.hero')) io.observe(el) });

/* ---------------- header ---------------- */
var hdr=$('#hdr'),burger=$('#burger'),hnav=$('#hnav');
function onScroll(){hdr.classList.toggle('on',scrollY>20)}
addEventListener('scroll',onScroll,{passive:true}); onScroll();
function closeMenu(){hdr.classList.remove('open');burger.setAttribute('aria-expanded','false');burger.setAttribute('aria-label','Open menu')}
burger.addEventListener('click',function(){
  var o=hdr.classList.toggle('open');burger.setAttribute('aria-expanded',o?'true':'false');burger.setAttribute('aria-label',o?'Close menu':'Open menu');
});
hnav.addEventListener('click',function(e){if(e.target.closest('a'))closeMenu()});
addEventListener('keydown',function(e){if(e.key==='Escape')closeMenu()});
(function(){
  var wrap=document.getElementById('lang'),btn=document.getElementById('langBtn'),menu=document.getElementById('langMenu');
  if(!wrap||!btn||!menu) return;
  var items=[].slice.call(menu.querySelectorAll('[role="menuitemradio"]')),cur=wrap.querySelector('.lang-cur');
  function isOpen(){return wrap.classList.contains('open')}
  function open(focusItem){wrap.classList.add('open');btn.setAttribute('aria-expanded','true');
    if(focusItem){var c=menu.querySelector('[aria-checked="true"]')||items[0];requestAnimationFrame(function(){c.focus()})}}
  function close(refocus){if(!isOpen())return;wrap.classList.remove('open');btn.setAttribute('aria-expanded','false');if(refocus)btn.focus()}
  btn.addEventListener('click',function(){isOpen()?close():open(false)});
  btn.addEventListener('keydown',function(e){if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open(true)}});
  items.forEach(function(it){it.addEventListener('click',function(){
    items.forEach(function(x){x.setAttribute('aria-checked',x===it?'true':'false')});
    cur.textContent=it.dataset.code; btn.setAttribute('aria-label','Site language: '+it.dataset.name); close(true);
  })});
  menu.addEventListener('keydown',function(e){var i=items.indexOf(document.activeElement);
    if(e.key==='ArrowDown'){e.preventDefault();items[(i+1)%items.length].focus()}
    else if(e.key==='ArrowUp'){e.preventDefault();items[(i-1+items.length)%items.length].focus()}
    else if(e.key==='Home'){e.preventDefault();items[0].focus()}
    else if(e.key==='End'){e.preventDefault();items[items.length-1].focus()}
    else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true)}
    else if(e.key==='Tab'){close(false)}});
  btn.addEventListener('keydown',function(e){if(e.key==='Escape'&&isOpen()){e.stopPropagation();close(false)}});
  document.addEventListener('click',function(e){if(!wrap.contains(e.target))close(false)});
})();

/* ---------------- globe variant switch: menu of links to the two pages (top bar on desktop, next to the burger on phones) ---------------- */
[['gv','gvBtn','gvMenu'],['gvM','gvBtnM','gvMenuM']].forEach(function(ids){(function(w,b,m){
  var wrap=document.getElementById(w),btn=document.getElementById(b),menu=document.getElementById(m);
  if(!wrap||!btn||!menu) return;
  var cur=document.documentElement.getAttribute('data-globe')||'white', items=[].slice.call(menu.querySelectorAll('[role="menuitemradio"]'));
  items.forEach(function(it){var on=it.getAttribute('data-globe')===cur; it.setAttribute('aria-checked',on?'true':'false');
    if(on) btn.setAttribute('aria-label','Globe variant: '+it.querySelector('b').textContent+', '+it.querySelector('.gv-t span').textContent)});
  function isOpen(){return wrap.classList.contains('open')}
  function open(focusItem){wrap.classList.add('open');btn.setAttribute('aria-expanded','true');
    if(focusItem){var c=menu.querySelector('[aria-checked="true"]')||items[0];requestAnimationFrame(function(){c.focus()})}}
  function close(refocus){if(!isOpen())return;wrap.classList.remove('open');btn.setAttribute('aria-expanded','false');if(refocus)btn.focus()}
  btn.addEventListener('click',function(){isOpen()?close():open(false)});
  btn.addEventListener('keydown',function(e){if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();open(true)}else if(e.key==='Escape'&&isOpen()){e.stopPropagation();close(false)}});
  items.forEach(function(it){it.addEventListener('click',function(e){if(it.getAttribute('aria-checked')==='true'){e.preventDefault();close(true)}})});
  menu.addEventListener('keydown',function(e){var i=items.indexOf(document.activeElement);
    if(e.key==='ArrowDown'){e.preventDefault();items[(i+1)%items.length].focus()}
    else if(e.key==='ArrowUp'){e.preventDefault();items[(i-1+items.length)%items.length].focus()}
    else if(e.key==='Home'){e.preventDefault();items[0].focus()}
    else if(e.key==='End'){e.preventDefault();items[items.length-1].focus()}
    else if(e.key===' '&&i>=0){e.preventDefault();items[i].click()}
    else if(e.key==='Escape'){e.preventDefault();e.stopPropagation();close(true)}
    else if(e.key==='Tab'){close(false)}});
  document.addEventListener('click',function(e){if(!wrap.contains(e.target))close(false)});
})(ids[0],ids[1],ids[2])});

/* ---------------- airports popup: a native modal <dialog>, so focus stays inside and Esc closes it ---------------- */
(function(){
  var dlg=$('#apd'); if(!dlg||typeof dlg.showModal!=='function') return;   // without <dialog> the grid still works
  var ph=dlg.querySelector('.apd-ph'), list=$('#apd-l'), back=null, timer=0;
  function esc(s){ return String(s).replace(/&/g,'&').replace(/</g,'&lt;') }
  function cleanup(){                                                      // runs once per close, whichever path closed it
    if(dlg.open||!document.documentElement.classList.contains('dlg-open')) return;
    clearTimeout(timer); dlg.classList.remove('show');
    document.documentElement.classList.remove('dlg-open'); document.body.style.paddingRight='';
    var b=back; back=null; if(b&&document.contains(b)) b.focus({preventScroll:true});
  }
  function open(k,trigger){
    var r=ROUTES[k], ap=AIRPORTS[k];
    ph.src=r[4];
    $('#apd-r').textContent=r[0]; $('#apd-n').textContent=ap.length+' airports'; $('#apd-t').textContent=r[1];
    list.innerHTML=ap.map(function(a){
      return '<li><span class="apd-code">'+esc(a[0])+'</span><span class="apd-nm"><b>'+esc(a[1])+'</b><span>'+esc(a[2])+'</span></span></li>';
    }).join('');
    list.scrollTop=0; back=trigger||null;
    clearTimeout(timer);                                                   // reopened while closing: stay open
    if(!dlg.open){
      var sb=innerWidth-document.documentElement.clientWidth;             // keep the page from shifting when the scrollbar hides
      document.documentElement.classList.add('dlg-open'); if(sb>0) document.body.style.paddingRight=sb+'px';
      dlg.showModal();
    }
    void dlg.offsetWidth;                                                  // commit the start state, then animate in
    dlg.classList.add('show');
  }
  function shut(then){
    if(!dlg.open) return;
    dlg.classList.remove('show');
    clearTimeout(timer); timer=setTimeout(function(){ dlg.close(); cleanup(); if(then) then() },RM?0:300);   // unlock the page before scrolling
  }
  dlg.addEventListener('close',cleanup);
  dlg.addEventListener('cancel',function(e){ e.preventDefault(); shut() });                 // Esc: animate out first
  dlg.querySelector('.apd-x').addEventListener('click',function(){ shut() });
  dlg.addEventListener('click',function(e){                                                  // click on the backdrop
    if(e.target!==dlg) return; var b=dlg.getBoundingClientRect();
    if(e.clientX<b.left||e.clientX>b.right||e.clientY<b.top||e.clientY>b.bottom) shut();
  });
  $('#apd-cta').addEventListener('click',function(e){ e.preventDefault(); back=null; shut(toQuote) });
  window.okwAirports=open;
})();

/* ---------------- routes grid: the frame you look at gets the room ---------------- */
(function(){
  var g=$('#rgrid'); if(!g) return;
  var cells=[].slice.call(g.querySelectorAll('.rt')), cur=-1;
  function tracks(k,on){ return [0,1,2].map(function(j){ return (on?(j===k?2.4:.8):1)+'fr' }).join(' ') }
  function set(i){
    if(i===cur) return; cur=i;
    g.style.gridTemplateColumns=tracks(i%3,i>=0); g.style.gridTemplateRows=tracks(Math.floor(i/3),i>=0);
    g.classList.toggle('has-on',i>=0);
    cells.forEach(function(el,k){ el.classList.toggle('on',k===i) });
  }
  function keyboardInside(){ try{ return !!g.querySelector(':focus-visible') }catch(e){ return g.contains(document.activeElement) } }
  var downOn=null;                                                           // was the frame already open when the press began?
  cells.forEach(function(el,i){
    el.addEventListener('pointerenter',function(e){ if(e.pointerType==='mouse') set(i) });
    el.addEventListener('focus',function(){ set(i) });
    el.addEventListener('pointerdown',function(){ downOn=(cur===i) });
    el.addEventListener('click',function(){
      var wasOn=downOn===null?cur===i:downOn; downOn=null;                   // keyboard clicks have no pointerdown
      set(i); if(!wasOn) return;                                             // touch: the first tap opens the frame
      var k=+el.dataset.k;
      if(k<0) toQuote(); else if(window.okwAirports) window.okwAirports(k,el);
    });
  });
  g.addEventListener('pointerleave',function(e){ if(e.pointerType==='mouse'&&!keyboardInside()) set(-1) });
  g.addEventListener('focusout',function(e){ if(!g.contains(e.relatedTarget)) set(-1) });
  document.addEventListener('pointerdown',function(e){ if(cur>=0&&!g.contains(e.target)) set(-1) },true);
})();

/* ---------------- contact card sky: the photo's golden horizon sits between the intro and the contact lines, at any card size ---------------- */
(function(){
  var ci=document.querySelector('.ci'), img=ci&&ci.querySelector('.ci-sky'), lines=ci&&ci.querySelector('.lines'), lead=lines&&lines.previousElementSibling;
  if(!img||!lead||!window.ResizeObserver) return;                 // CSS cover + crop stays as the fallback
  var HZ=.672, AR=1.5;                                             // horizon at 67.2% of the photo's height; the photo is 2:3
  function fit(){
    var W=ci.clientWidth, H=ci.clientHeight; if(!W||!H) return;
    var target=(lead.offsetTop+lead.offsetHeight+lines.offsetTop)/2;
    var w=Math.max(W,H/AR), h=w*AR;                                // cover
    if(h*(1-HZ)<H-target){ h=(H-target)/(1-HZ); w=h/AR }           // zoom in until the clouds still reach the bottom
    var top=Math.min(0,Math.max(H-h,target-h*HZ)), left=(W-w)*.6;  // crop a little more on the left: keep the gold side
    img.style.cssText='max-width:none;object-fit:fill;transform:none;right:auto;bottom:auto;width:'+w.toFixed(1)+'px;height:'+h.toFixed(1)+'px;left:'+left.toFixed(1)+'px;top:'+top.toFixed(1)+'px';
  }
  var ro=new ResizeObserver(fit); ro.observe(ci); ro.observe(lead); ro.observe(lines);
})();

/* ---------------- custom selects (select-only combobox pattern); the hidden native <select> keeps the value ---------------- */
(function(){
  var TICK='<svg class="cs-tick" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M21.5303 5.46967C21.8232 5.76256 21.8232 6.23744 21.5303 6.53033L9.53033 18.5303C9.23744 18.8232 8.76256 18.8232 8.46967 18.5303L2.46967 12.5303C2.17678 12.2374 2.17678 11.7626 2.46967 11.4697C2.76256 11.1768 3.23744 11.1768 3.53033 11.4697L9 16.9393L20.4697 5.46967C20.7626 5.17678 21.2374 5.17678 21.5303 5.46967Z" fill="currentColor"/></svg>', CHEV='<svg class="cs-chev" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M 12 18 c -0.256 0 -0.512 -0.0973 -0.7067 -0.2933 L 2.96 9.3733 c -0.3907 -0.3907 -0.3907 -1.024 0 -1.4147 s 1.024 -0.3907 1.4147 0 l 7.6266 7.6266 7.6266 -7.6266 c 0.3907 -0.3907 1.024 -0.3907 1.4147 0 s 0.3907 1.024 0 1.4147 l -8.3333 8.3333 c -0.1947 0.1947 -0.4507 0.2933 -0.7067 0.2933 Z" fill="currentColor"></path></svg>', all=[], uid=0;
  function norm(s){return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase()}
  document.addEventListener('pointerdown',function(e){
    all.forEach(function(c){ if(c.isOpen()&&!c.wrap.contains(e.target)&&!(c.lab&&c.lab.contains(e.target))) c.close(false) });
  },true);
  [].forEach.call(document.querySelectorAll('select'),function(sel){
    if(!sel.id) sel.id='cs'+(++uid);
    var id=sel.id, lab=document.querySelector('label[for="'+id+'"]');
    if(lab&&!lab.id) lab.id=id+'-lab';
    var wrap=document.createElement('div'), btn=document.createElement('div'), list=document.createElement('ul');
    wrap.className='cs';
    btn.className='cs-btn'; btn.id=id+'-cb'; btn.tabIndex=0;
    btn.setAttribute('role','combobox'); btn.setAttribute('aria-haspopup','listbox');
    btn.setAttribute('aria-expanded','false'); btn.setAttribute('aria-controls',id+'-lb');
    btn.innerHTML='<span class="cs-val"></span>'+CHEV;
    list.className='cs-list'; list.id=id+'-lb'; list.tabIndex=-1; list.setAttribute('role','listbox');
    if(lab){ btn.setAttribute('aria-labelledby',lab.id); list.setAttribute('aria-labelledby',lab.id) }
    var val=btn.firstChild, active=-1, open=false, typed='', typedT=0, api;
    var opts=[].map.call(sel.options,function(o,i){
      var li=document.createElement('li'); li.className='cs-opt'; li.id=id+'-o'+i; li.setAttribute('role','option');
      li.innerHTML='<span></span>'+TICK; li.firstChild.textContent=o.text;
      li.addEventListener('pointermove',function(){ if(active!==i) setActive(i) });
      li.addEventListener('click',function(){ choose(i); close(true) });
      list.appendChild(li); return li;
    });
    sel.parentNode.insertBefore(wrap,sel); wrap.appendChild(btn); wrap.appendChild(list); wrap.appendChild(sel);
    sel.classList.add('cs-native'); sel.tabIndex=-1; sel.setAttribute('aria-hidden','true');
    list.addEventListener('mousedown',function(e){ e.preventDefault() });            // keep focus on the combobox
    function sync(){ var s=sel.selectedIndex; val.textContent=s>=0?sel.options[s].text:'';
      opts.forEach(function(li,k){ li.setAttribute('aria-selected',k===s?'true':'false') }) }
    function setActive(i){
      if(i<0||i>=opts.length) return;
      if(active>=0) opts[active].classList.remove('is-active');
      active=i; var li=opts[i]; li.classList.add('is-active'); btn.setAttribute('aria-activedescendant',li.id);
      if(li.offsetTop<list.scrollTop) list.scrollTop=li.offsetTop;
      else if(li.offsetTop+li.offsetHeight>list.scrollTop+list.clientHeight) list.scrollTop=li.offsetTop+li.offsetHeight-list.clientHeight;
    }
    function choose(i){
      if(i<0||sel.selectedIndex===i) return;
      sel.selectedIndex=i; sync();
      sel.dispatchEvent(new Event('input',{bubbles:true})); sel.dispatchEvent(new Event('change',{bubbles:true}));
    }
    function place(){
      wrap.classList.remove('up','end');
      var r=(wrap.closest('.qf')||wrap).getBoundingClientRect(), h=list.offsetHeight, w=list.offsetWidth;
      if(innerHeight-r.bottom<h+16&&r.top>innerHeight-r.bottom) wrap.classList.add('up');
      if(r.left+w>document.documentElement.clientWidth-12) wrap.classList.add('end');
    }
    function show(i){
      if(open){ if(i!=null) setActive(i); return }
      all.forEach(function(c){ if(c!==api) c.close(false) });
      open=true; place(); wrap.classList.add('open'); btn.setAttribute('aria-expanded','true');
      setActive(i!=null?i:Math.max(0,sel.selectedIndex));
    }
    function close(focus){
      if(!open) return;
      open=false; wrap.classList.remove('open'); btn.setAttribute('aria-expanded','false'); btn.removeAttribute('aria-activedescendant');
      if(active>=0) opts[active].classList.remove('is-active'); active=-1;
      if(focus) btn.focus({preventScroll:true});
    }
    function find(ch){                                 // type-ahead, accent-insensitive (s finds Supradimensionată)
      var now=Date.now(), n=opts.length; typed=(now-typedT>600?'':typed)+norm(ch); typedT=now;
      var start=Math.max(open?active:sel.selectedIndex,0);
      for(var k=0;k<n;k++){ var i=(start+(typed.length>1?k:k+1))%n; if(norm(sel.options[i].text).indexOf(typed)===0) return i }
      return -1;
    }
    btn.addEventListener('click',function(){ open?close(false):show() });
    btn.addEventListener('blur',function(){ setTimeout(function(){ if(open&&!wrap.contains(document.activeElement)) close(false) },0) });
    btn.addEventListener('keydown',function(e){
      var k=e.key, n=opts.length, plain=k.length===1&&!e.ctrlKey&&!e.metaKey&&!e.altKey, f;
      if(!open){
        if(k==='ArrowDown'||k==='ArrowUp'||k==='Enter'||k===' '){ e.preventDefault(); show() }
        else if(k==='Home'){ e.preventDefault(); show(0) }
        else if(k==='End'){ e.preventDefault(); show(n-1) }
        else if(plain){ f=find(k); if(f>=0){ e.preventDefault(); choose(f) } }
        return;
      }
      if(e.altKey&&k==='ArrowUp'){ e.preventDefault(); choose(active); close(true); return }
      switch(k){
        case 'ArrowDown': e.preventDefault(); setActive(Math.min(n-1,active+1)); break;
        case 'ArrowUp': e.preventDefault(); setActive(Math.max(0,active-1)); break;
        case 'Home': case 'PageUp': e.preventDefault(); setActive(0); break;
        case 'End': case 'PageDown': e.preventDefault(); setActive(n-1); break;
        case 'Escape': e.preventDefault(); e.stopPropagation(); close(true); break;
        case 'Tab': choose(active); close(false); break;
        case 'Enter': e.preventDefault(); choose(active); close(true); break;
        case ' ': e.preventDefault(); if(typed&&Date.now()-typedT<600){ f=find(' '); if(f>=0) setActive(f) } else { choose(active); close(true) } break;
        default: if(plain){ f=find(k); if(f>=0){ e.preventDefault(); setActive(f) } }
      }
    });
    if(lab) lab.addEventListener('click',function(e){ e.preventDefault(); btn.focus({preventScroll:true}); open?close(false):show() });
    sel.addEventListener('change',sync);
    if(sel.form) sel.form.addEventListener('reset',function(){ setTimeout(sync,0) });
    sync();
    api={wrap:wrap,lab:lab,isOpen:function(){return open},close:close};
    all.push(api);
  });
})();

/* ---------------- go to the quote form ---------------- */
function toQuote(){
  $('#contact').scrollIntoView({behavior:RM?'auto':'smooth',block:'start'});
  setTimeout(function(){$('#f-name').focus({preventScroll:true})},RM?0:650);
}

/* ---------------- quick quote -> full form ---------------- */
$('#quick').addEventListener('submit',function(e){
  e.preventDefault();
  $('#f-from').value=$('#q-from').value; $('#f-to').value=$('#q-to').value;
  $('#f-kg').value=($('#q-kg').value||'').replace(/[^\d.,]/g,''); $('#f-type').value=$('#q-type').value; $('#f-type').dispatchEvent(new Event('change'));
  toQuote();
});
var yr=$('#yr'); if(yr) yr.textContent=new Date().getFullYear();   // copyright year stays current
$('#f').addEventListener('submit',function(e){
  e.preventDefault();
  var n=$('#note'); n.textContent='Demo form: on the live site, your request goes straight to a manager.'; n.classList.add('ok');
});

})();
/* ---------- liquid-glass white buttons (technique: ReactBits GlassSurface, SVG backdrop refraction) ---------- */
(function(){
  var ua=navigator.userAgent;
  if(/Firefox/.test(ua)||(/Safari/.test(ua)&&!/Chrome|Chromium|Edg/.test(ua))) return;
  var probe=document.createElement('div'); probe.style.backdropFilter='url(#okw-probe)';
  if(!probe.style.backdropFilter) return;
  var NS='http://www.w3.org/2000/svg', G={edge:.07,bright:50,op:.93,blur:7,scale:-90,off:[0,8,16]};
  var host=document.createElementNS(NS,'svg'), defs=document.createElementNS(NS,'defs');
  host.setAttribute('aria-hidden','true'); host.setAttribute('focusable','false');
  host.style.cssText='position:absolute;width:0;height:0;overflow:hidden;pointer-events:none';
  host.appendChild(defs); document.body.appendChild(host);
  function el(tag,at){var e=document.createElementNS(NS,tag);for(var k in at)e.setAttribute(k,at[k]);return e}
  function map(w,h,r){
    var e=Math.min(w,h)*G.edge*.5;
    var s='<svg xmlns="http://www.w3.org/2000/svg" width="'+w+'" height="'+h+'" viewBox="0 0 '+w+' '+h+'"><defs>'+
      '<linearGradient id="r" x1="100%" y1="0%" x2="0%" y2="0%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="red"/></linearGradient>'+
      '<linearGradient id="b" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stop-color="#0000"/><stop offset="100%" stop-color="blue"/></linearGradient>'+
      '<filter id="s" filterUnits="userSpaceOnUse" x="0" y="0" width="'+w+'" height="'+h+'" color-interpolation-filters="sRGB"><feGaussianBlur stdDeviation="'+G.blur+'"/></filter></defs>'+
      '<rect width="'+w+'" height="'+h+'" fill="black"/>'+
      '<rect width="'+w+'" height="'+h+'" rx="'+r+'" fill="url(#r)"/>'+
      '<rect width="'+w+'" height="'+h+'" rx="'+r+'" fill="url(#b)" style="mix-blend-mode:difference"/>'+
      '<rect x="'+e+'" y="'+e+'" width="'+(w-2*e)+'" height="'+(h-2*e)+'" rx="'+r+'" fill="hsl(0 0% '+G.bright+'% / '+G.op+')" filter="url(#s)"/></svg>';
    return 'data:image/svg+xml,'+encodeURIComponent(s);
  }
  var M=['1 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 1 0','0 0 0 0 0 0 1 0 0 0 0 0 0 0 0 0 0 0 1 0','0 0 0 0 0 0 0 0 0 0 0 0 1 0 0 0 0 0 1 0'];
  [].forEach.call(document.querySelectorAll('.btn-line'),function(btn,n){
    var id='okw-glass-'+n, f=el('filter',{id:id,'color-interpolation-filters':'sRGB',x:'0%',y:'0%',width:'100%',height:'100%'});
    var img=el('feImage',{x:0,y:0,width:'100%',height:'100%',preserveAspectRatio:'none',result:'map'}); f.appendChild(img);
    ['r','g','b'].forEach(function(c,i){
      f.appendChild(el('feDisplacementMap',{'in':'SourceGraphic',in2:'map',scale:G.scale+G.off[i],xChannelSelector:'R',yChannelSelector:'G',result:'d'+c}));
      f.appendChild(el('feColorMatrix',{'in':'d'+c,type:'matrix',values:M[i],result:c}));
    });
    f.appendChild(el('feBlend',{'in':'r',in2:'g',mode:'screen',result:'rg'}));
    f.appendChild(el('feBlend',{'in':'rg',in2:'b',mode:'screen'}));
    defs.appendChild(f);
    var last='';
    function fit(){var w=btn.offsetWidth,h=btn.offsetHeight,k=w+'x'+h;if(!w||!h||k===last)return;last=k;
      img.setAttribute('href',map(w,h,parseFloat(getComputedStyle(btn).borderTopLeftRadius)||12))}
    fit(); if(window.ResizeObserver) new ResizeObserver(fit).observe(btn);
    btn.style.setProperty('--glass','url(#'+id+')'); btn.classList.add('is-liquid');
  });
})();
