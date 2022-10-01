// ==UserScript==
// @name		GSI4D - Google search improve for developers
// @description	Google search improve for developers.
// @version		1.2.10
// @include		/^https://www\.google\.co(m|\.jp)/search.+$/
// @author		yanorei32
// @supportURL	https://github.com/Yanorei32/GSI4D/issues
// @website		http://yano.teamfruit.net/~rei/
// @namespace	http://yano.teamfruit.net/~rei/
// @updateURL	https://raw.githubusercontent.com/Yanorei32/GSI4D/master/gsi4d.user.js
// @license		MIT License
// @run-at		document-end
// @grant		none
// ==/UserScript==

fetch('https://raw.githubusercontent.com/seigo2016/GSI4D/feature/migrate_to_firefox_addon/rule.json').then(response => response.json())
.then(data => run(data));
function run (site) {
const SearchTypes = {
	Default:	'',
	Image:		'isch',
	Video:		'vid',
	News:		'nws',
	Shop:		'shop',
	Books:		'bks',
	Patent:		'ptd',
	Unknown:	null,
};

const deleteElement = (e) => {
	if (e.parentElement !== null)
		e.parentElement.removeChild(e);
};

const formatGSI4DLog = (log) => {
	return `GSI4D Blocked: ${log.blockedCount} Tracked: ${log.trackedCount}`;
};

const pageStyle = {
	PC: {
		supportSearchTypes: [
			SearchTypes.Default,
			SearchTypes.Video,
			SearchTypes.Image,
		],

		getLinkElems: (st, parentE) => {
			if (st === SearchTypes.Image)
				return parentE.querySelectorAll('a.VFACy.kGQAp.sMi44c.lNHeqe');

			return parentE.querySelectorAll('div.g a:not(.fl):not(.GHDvEf)');
		},

		coloriseCandidateByLinkElem: (st, linkE, color) => {
			if (st === SearchTypes.Image) {
				linkE.parentElement.style.backgroundColor = color;
				return;
			}

			linkE.parentElement.parentElement.parentElement.style.backgroundColor = color;
		},

		deleteCandidateByLinkElem: (st, linkE) => {
			if (st === SearchTypes.Image) {
				deleteElement(linkE.parentElement);
				return;
			}

			deleteElement(
				linkE.parentElement.parentElement.parentElement
			);
		},

		writeLog: (st, formatedLog) => {
			if (st === SearchTypes.Image)
				return;

			document.getElementById('result-stats').innerHTML += formatedLog;
		},

		after: (st) => {
			if (st !== SearchTypes.Image)
				return;

			(new MutationObserver(( records ) => {
				for (const record of records)
					for (const addedNode of record.addedNodes)
						if (addedNode.nodeType == Node.ELEMENT_NODE)
							linkProcess(st, addedNode);

			})).observe(
				document.querySelector('.islrc'),
				{ childList: true },
			);
		},
	},
	Phone: {
		supportSearchTypes: [
		],

		getLinkElems: (st, parentE) => {
			if (st === SearchTypes.Image)
				return document.querySelectorAll('.iKjWAf');

			return parentE.querySelectorAll('div.kCrYT>a');
		},

		coloriseCandidateByLinkElem: (st, linkE, color) => {
			if (st === SearchTypes.Image) {
				linkE.style.backgroundColor = color;
				return;
			}

			linkE.parentElement.parentElement.style.backgroundColor = color;
		},

		deleteCandidateByLinkElem: (st, linkE) => {
			if (st === SearchTypes.Image) {
				deleteElement(
					linkE.parentElement
				);
				return;
			}

			deleteElement(
				linkE.parentElement.parentElement.parentElement
			);
		},

		writeLog: (st, formatedLog) => {
			if (st === SearchTypes.Image)
				return;

			const cardContainer = document.createElement('div');
			const card = document.createElement('div');
			const cardSpan = document.createElement('span');
			const cardText = document.createElement('div');

			cardContainer.classList.add('ZINbbc', 'xpd', 'O9g5cc', 'uUPGi', 'gsi4d');
			card.classList.add('kCrYT');
			cardText.classList.add('BNeawe', 's3v9rd', 'AP7Wnd');
			cardText.textContent = formatedLog;

			cardSpan.appendChild(cardText);
			card.appendChild(cardSpan);
			cardContainer.appendChild(card);
			document.getElementById('main').childNodes[1].after(cardContainer);
		},

		after: (st) => {
			if (st !== SearchTypes.Image)
				return;

			for (const col of document.querySelectorAll('div#islrg>div>div'))
				(new MutationObserver(( records ) => {
					for (const record of records)
						for (const addedNode of record.addedNodes)
							if (addedNode.nodeType == Node.ELEMENT_NODE)
								linkProcess(st, addedNode);
				})).observe(
					col,
					{ childList: true },
				);
		},
	},
};

const getPageStyle = () => {
	if (window.navigator.userAgent.toLowerCase().indexOf('mobile') !== -1) {
		console.log('PageStyle: Phone');
		return pageStyle.Phone;
	}

	console.log('PageStyle: PC');
	return pageStyle.PC;
};

const parseURL = (url) => {
	if (!url.startsWith('/url?') && url.indexOf('://'))
		return url;

	if (!url.startsWith('/url?')) {
		console.error('Unsupported URL: ' + url);
		return '';
	}

	const paramStrs = url.split('?')[1].split('&');

	for (const paramStr of paramStrs) {
		const parsedParam = paramStr.split('=');

		if (parsedParam[0] !== 'q')
			continue;

		if (parsedParam.length !== 2)
			continue;

		if (parsedParam[1].indexOf('://')) {
			return parsedParam[1];
		}

		return decodeURI(parsedParam[1]);
	}

	console.error('Failed to read URL from /url?: ' + url);
	return '';
};

const parseSearchURL = (url) => {
	const paramStrs = url.split('?')[1].split('&');

	for (const paramStr of paramStrs) {
		const parsedParam = paramStr.split('=');

		if (parsedParam[0] !== 'tbm')
			continue;

		if (parsedParam.length !== 2)
			continue;

		for (const [_, searchType] of Object.entries(SearchTypes))
			if (parsedParam[1] === searchType)
				return searchType;

		return SearchTypes.Unknown;
	}

	return SearchTypes.Default;
};

const parseLinkElement = (st, link) => {
	if (link.tagName === 'DIV') {
		const parsedJSON = JSON.parse(link.innerHTML);

		if (parsedJSON['ru'] == undefined) {
			console.error('Link element has not ru.');
			console.error(link);
			return '';
		}

		return parsedJSON['ru'];
	}

	const rawHref = link.getAttribute('href');

	if (rawHref === null) {
		console.error('Link element has not href.');
		console.error(link);
		return '';
	}

	return parseURL(rawHref);
};

const linkProcess = (st, parentE) => {
	linkLoop:
	for (const link of p.getLinkElems(st, parentE)) {
		const url = parseLinkElement(st, link);
		if (url === '')
			continue linkLoop;

		for (const [_, siteType] of Object.entries(site)) {
			for (const siteStr of siteType.list) {
				if (url.indexOf(siteStr) === -1)
					continue;

				/* found! yay! */

				if (siteType.isBlacklist) {
					p.deleteCandidateByLinkElem(st, link);
					log.blockedCount ++;
					continue linkLoop;
				}

				p.coloriseCandidateByLinkElem(st, link, siteType.color);
				log.trackedCount ++;
				continue linkLoop;
			}
		}
	}
};

const currentST = parseSearchURL(location.href);
if (currentST === SearchTypes.Unknown) {
	console.debug('Unknown search type');
	return;
}

const p = getPageStyle();

if (!p.supportSearchTypes.includes(currentST)) {
	console.debug('Unsupported search type in this platform.');
	return;
}

const log = {
	blockedCount: 0,
	trackedCount: 0,
};

	linkProcess(currentST, document);

	p.writeLog(currentST, formatGSI4DLog(log));
	p.after(currentST);
};