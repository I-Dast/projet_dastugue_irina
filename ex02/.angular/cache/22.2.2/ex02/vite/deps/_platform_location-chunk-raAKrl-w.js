import { Al as ɵɵdefineInjectable, Fn as Injectable, Wi as setClassMetadata, _c as DOCUMENT, dl as inject, kc as InjectionToken } from "./core-Cv98Z2sf.js";
//#region node_modules/@angular/common/fesm2022/_platform_location-chunk.mjs
/**
* @license Angular v22.2.3
* (c) 2010-2026 Google LLC. https://angular.dev/
* License: MIT
*/
var _DOM = null;
function getDOM() {
	return _DOM;
}
function setRootDomAdapter(adapter) {
	_DOM ??= adapter;
}
var DomAdapter = class {};
var PlatformLocation = class PlatformLocation {
	historyGo(relativePosition) {
		throw new Error(ngDevMode ? "Not implemented" : "");
	}
	static ɵfac = function PlatformLocation_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || PlatformLocation)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineInjectable({
		token: PlatformLocation,
		factory: () => (() => inject(BrowserPlatformLocation))(),
		providedIn: "platform"
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(PlatformLocation, [{
		type: Injectable,
		args: [{
			providedIn: "platform",
			useFactory: () => inject(BrowserPlatformLocation)
		}]
	}], null, null);
})();
var LOCATION_INITIALIZED = new InjectionToken(typeof ngDevMode !== "undefined" && ngDevMode ? "Location Initialized" : "");
var BrowserPlatformLocation = class BrowserPlatformLocation extends PlatformLocation {
	_location;
	_history;
	_doc = inject(DOCUMENT);
	constructor() {
		super();
		this._location = window.location;
		this._history = window.history;
	}
	getBaseHrefFromDOM() {
		return getDOM().getBaseHref(this._doc);
	}
	onPopState(fn) {
		const window = getDOM().getGlobalEventTarget(this._doc, "window");
		window.addEventListener("popstate", fn, false);
		return () => window.removeEventListener("popstate", fn);
	}
	onHashChange(fn) {
		const window = getDOM().getGlobalEventTarget(this._doc, "window");
		window.addEventListener("hashchange", fn, false);
		return () => window.removeEventListener("hashchange", fn);
	}
	get href() {
		return this._location.href;
	}
	get protocol() {
		return this._location.protocol;
	}
	get hostname() {
		return this._location.hostname;
	}
	get port() {
		return this._location.port;
	}
	get pathname() {
		return this._location.pathname;
	}
	get search() {
		return this._location.search;
	}
	get hash() {
		return this._location.hash;
	}
	set pathname(newPath) {
		this._location.pathname = newPath;
	}
	pushState(state, title, url) {
		this._history.pushState(state, title, url);
	}
	replaceState(state, title, url) {
		this._history.replaceState(state, title, url);
	}
	forward() {
		this._history.forward();
	}
	back() {
		this._history.back();
	}
	historyGo(relativePosition = 0) {
		this._history.go(relativePosition);
	}
	getState() {
		return this._history.state;
	}
	static ɵfac = function BrowserPlatformLocation_Factory(__ngFactoryType__) {
		return new (__ngFactoryType__ || BrowserPlatformLocation)();
	};
	static ɵprov = /*@__PURE__*/ ɵɵdefineInjectable({
		token: BrowserPlatformLocation,
		factory: () => (() => new BrowserPlatformLocation())(),
		providedIn: "platform"
	});
};
(() => {
	(typeof ngDevMode === "undefined" || ngDevMode) && setClassMetadata(BrowserPlatformLocation, [{
		type: Injectable,
		args: [{
			providedIn: "platform",
			useFactory: () => new BrowserPlatformLocation()
		}]
	}], () => [], null);
})();
//#endregion
export { setRootDomAdapter as a, getDOM as i, LOCATION_INITIALIZED as n, PlatformLocation as r, DomAdapter as t };
