(function() {
	function debug_log() {
		// XXX uncomment this for debugging
		//console.log.apply(console, arguments);
	}

	// get query variable from given URL
	function getqv(url, name) {
		var vars = url.replace(/^[^?]*\?/, '').split('&'); 
		for (var i = 0; i < vars.length; i++) {
			var kv = vars[i].split('=');
			if (decodeURIComponent(kv[0]) == name)
				return decodeURIComponent(kv[1]);
		}
	}

	function modifyLinks() {
		[].forEach.call(document.querySelectorAll('a.original_url'), function (e) {
			var href = e.getAttribute('href');
			// skip if the URL is already the original
			if (href.indexOf('getpocket.com') === -1)
				return;
			var url = getqv(href, 'url');
			e.setAttribute('href', url);
			e.setAttribute('rel', (e.getAttribute('rel') || '') + ' noreferrer');
		});
	}

	function addClickHandler() {
		function stop_prop(ev) {
			debug_log('stop prop for ', ev);
			ev.stopPropagation();
			ev.stopImmediatePropagation();
			return false;
		}

		[].forEach.call(document.querySelectorAll('div.item_content'), function (el) {
			el.addEventListener('focus', stop_prop);
			el.addEventListener('click', stop_prop);
		});

		[].forEach.call(document.querySelectorAll('a.item_link'), function (el) {
			el.addEventListener('focus', stop_prop);
			el.addEventListener('click', stop_prop);
		});
	}



	function isLoading(e) {
		var loading_re = new RegExp('(?:^|\\s)loading(?!\\S)');
		return loading_re.test(e.getAttribute('class'));
	}


	var checkTimer = false;

	// checks if the reading list is indeed being loaded
	// sets up a timer to wait for it to be loaded, then modify links
	function checkPageNav(e) {
		if (checkTimer !== false)
			return;

		checkTimer = setInterval(checkLoaded, 500);

		function checkLoaded(e) {
			debug_log('checking if page finished loading...');
			var list = document.querySelector('#content > #page_queue');
			if (list !== null) {
				list.addEventListener('DOMNodeInserted', checkPageNav);

				// check if list is still loading...
				if (! isLoading(list)) {
					debug_log('page loaded. modifying now');
					clearInterval(checkTimer);
					checkTimer = false;

					modifyLinks();
					addClickHandler();
					return;
				}
			}
			debug_log('still not loaded.');
		}
	}

	// if this is a page nav, check if we need to re-modify the list
	window.addEventListener('click', checkPageNav);

	// do the modify list on initial page load
	checkPageNav();
})();

