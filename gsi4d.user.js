// ==UserScript==
// @name		GSI4D - Google search improve for developers
// @description	Google search improve for developers.
// @version		0.8.7
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

(function() {
	'use strict';

	const site = {
		reference: {
			isBlackList: false,
			color: '#EFE',
			list: [
				// Microsoft
				'windows.com',
				'msdn.microsoft.com',
				'docs.microsoft.com',
				
				// Oracle
				'docs.oracle.com',
				
				// Mozilla
				'developer.mozilla.org',

				// Google
				'cloud.google.com',
				'developers.google.com',

				// RedHat
				'access.redhat.com/documentation',

				// Docker
				'hub.docker.com',

				// GitHub
				'github.com',
				
				// OSDN
				'osdn.net',
				
				// sourceforge
				'sourceforge.net',

				// Golang
				'golang.org',
				'godoc.org',

				// Ruby
				'ruby-lang.org',
				'ruby-doc.org',
				'railsdoc.com',
				'rubygems.org',

				// Python
				'python.jp',
				'python.org',
				'requests-docs-ja.readthedocs.io',
				'python-requests.org',

				// Raspberry Pi
				'raspberrypi.org',

				// IPA
				'ipa.go.jp',
				
				// w3school.com
				'w3schools.com',
				
				// PHP
				'php.net',
				
				// Apache
				'apache.org',

				// Unity 3D
				'docs.unity3d.com',
			],
		},

		recommend: {
			isBlacklist: false,
			color: '#EFF',
			list: [
				// Web系を調べていると行き着く。
				'tohoho-web.com',
				'htmq.com',

				// JavaScript周りを調べると行き着く。
				'jsprimer.net',

				// VBやC#を調べていると行き着く。
				'dobon.net',

				// Python周りを調べると行き着く。
				'note.nkmk.me',
				
				// Win2Kを調べると行き着く。
				'blog.livedoor.jp/blackwingcat',
				
				// Go周りを調べると行き着く。
				'ashitani.jp/golangtips/',
				
				// Apacheを調べていて行き着いた。
				'park12.wakwak.com/~eslab/pcmemo/',
				
				// C++を調べていたときに行き着いた。
				'cpprefjp.github.io',
				'cppreference.com',
				'ufcpp.net',
			],
		},
		
		recommendForum: {
			isBlacklist: false,
			color: '#EEE',
			list: [
				'stackexchange.com',
				'stackoverflow.com',
				'superuser.com',
				'teratail.com',
				'askubuntu.com',
				'reddit.com',
			],
		},

		// 任意のユーザーが使えるサービス。比較的良質な物が多い。
		publicService: {
			isBlacklist: false,
			color: '#FFE',
			list: [
				'qiita.com',
			],
		},

		blackList: {
			isBlacklist: true,
			color: undefined,
			list: [
				// 微妙な入門講座が引っかかった事があった。
				'employment.en-japan.com',

				// 誤った情報を大々的に掲載している。
				'profession-net.com',
				'symmetric.co.jp',

				
				// ADBlockerが有効だとコンテンツを見せない
				'server-setting.info',

				// 侍エンジニア。画像が多くて嫌い。
				'sejuku.net',

				// 画像や広告が多くて嫌い。
				'techacademy.jp',
				'programming-study.com',
				'codecamp.jp',
				'tadaken3.hatenablog.jp',
				'udemy.benesse.co.jp',
				'techplay.jp',
				'furien.jp',
				'eng-entrance.com',
				'unitopi.com',
				'internetacademy.jp',

				// コピペ(翻訳)サイト
				'bunnyinside.com',
				'forsenergy.com',
				'jp.mytory.net',
				'phpspot.net/php/man/',
				'code.i-harness.com',
				'stackovernet.com',
				'stackoverrun.com',
				'codeday.me',
				'code-examples.net',
				'code-adviser.com',
				'kotaeta.com',
				'tutorialmore.com',
				'living-sun.com',
				'it-swarm.net',
				'voidcc.com',

				// AdSite
				'solvusoft.com',
				'reviversoft.com',
				'dll-files.com',
				'softonic.com',
				'softonic.jp',
				'systweak.com',
				'chip.de',
				'qpdownload.com',
				'jaleco.com',
				'findmysoft.com',
			],
		},
	};

	const deleteElement = (e) => {
		e.parentElement.removeChild(e);
	};

	const formatGSI4DLog = (log) => {
		return `GSI4D Blocked: ${log.blockedCount} Tracked: ${log.trackedCount}`;
	};

	const pageStyle = {
		PC: {
			getLinkElems: () => {
				return document.querySelectorAll('div.r>a');
			},

			coloriseCandidateByLinkElem: (linkE, color) => {
				return linkE.parentElement.parentElement.parentElement.parentElement.style.backgroundColor = color;
			},

			deleteCandidateByLinkElem: (linkE) => {
				deleteElement(
					linkE.parentElement.parentElement.parentElement.parentElement
				);
			},

			writeLog: (formatedLog) => {
				document.getElementById('resultStats').innerHTML += formatedLog;
			},
		},
		Phone: {
			getLinkElems: () => {
				return document.querySelectorAll('div.kCrYT>a');
			},

			coloriseCandidateByLinkElem: (linkE, color) => {
				linkE.parentElement.parentElement.style.backgroundColor = color;
			},

			deleteCandidateByLinkElem: (linkE) => {
				deleteElement(
					linkE.parentElement.parentElement.parentElement
				);
			},

			writeLog: (formatedLog) => {
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
		},
	};

	const getPageStyle = () => {
		if (document.getElementById('resultStats') === null) {
			console.log('PageStyle: Phone');
			return pageStyle.Phone;
		}

		console.log('PageStyle: PC');
		return pageStyle.PC;
	};

	const parseURL = (url) => {
		if (url.indexOf('://'))
			return url;

		if (!url.startsWith('/url?')) {
			console.error('Unsupported URL: ' + url);
			return '';
		}

		const paramStrs = url.split('?')[1].split('&');

		for (const paramStr of paramStrs) {
			const parsedParam = parsedParam.split('=');
			
			if (parsedParam[0] != 'q')
				continue;

			if (parsedParam.length != 2)
				continue;

			return decodeURI(parsedParam[1]); 
		}

		console.error('Failed to read URL from /url?: ' + url);
		return '';
	};


	const p = getPageStyle();
	const log = {
		blockedCount: 0,
		trackedCount: 0,
	};

	linkLoop:
	for (const link of p.getLinkElems()) {
		const rawHref = link.getAttribute('href');

		if (rawHref === null) {
			console.error('Link element has not href.');
			console.error(link);
			continue linkLoop;
		}

		const url = parseURL(rawHref);
		if (url === '')
			continue linkLoop;

		for (const [_, siteType] of Object.entries(site)) {
			for (const siteStr of siteType.list) {
				if (rawHref.indexOf(siteStr) === -1)
					continue;

				/* found! yay! */

				if (siteType.isBlacklist) {
					p.deleteCandidateByLinkElem(link);
					log.blockedCount ++;
					continue linkLoop;
				}

				p.coloriseCandidateByLinkElem(link, siteType.color);
				log.trackedCount ++;
				continue linkLoop;
			}
		}
	}

	p.writeLog(formatGSI4DLog(log));
})();

