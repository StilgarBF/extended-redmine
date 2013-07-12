// ==UserScript==
// @id	redmineext@tid
// @name Redmine Extension
// @namespace http://projekt2k.de/
// @description Redmine Extension
// @match http://192.168.178.32/redmine/*
// @version 0.1
// ==/UserScript==

var extendedRedmine = {

	/**
	 * will add jquery and jqueryui, then call init
	 */
	prepare : function() {

		// Ensure jQuery and jQuery UI are loaded and available before
		if(	window.jQuery === undefined
			|| window.jQuery.fn.jquery < MIN_JQUERY_VERSION
			|| window.jQueryUI === undefined)
		{
			loadJQuery();
		} else {
			extendedRedmine.init();
		}
		
		/**
		 * add jQueryUI - script to the DOM. onload - init will be called
		 */
		function loadJQueryUI() {
			var done = false;
			var script = document.createElement("script");
			script.src = "//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js";
			script.onload = script.onreadystatechange = function() {
				if(!done && (!this.readyState || this.readyState === "loaded"
					|| this.readyState == "complete"))
				{
					done = true;
					extendedRedmine.init();
				}
			};
			document.getElementsByTagName("head")[0].appendChild(script);
			jQuery('head').append('<link rel="stylesheet" href="//cdnjs.cloudflare.com/ajax/libs/jqueryui/1.10.3/css/base/jquery-ui.css" type="text/css" />');
		}
		
		/**
		 * add jQuery - script to the DOM. onload - jQueryUI will be added
		 */
		function loadJQuery() {
			var done = false;
			var script = document.createElement("script");
			script.src = "//cdnjs.cloudflare.com/ajax/libs/jquery/2.0.3/jquery.min.js";
			script.onload = script.onreadystatechange = function() {
				if(!done && (!this.readyState || this.readyState === "loaded"
					|| this.readyState == "complete"))
				{
					$.noConflict();
					done = true;
					loadJQueryUI();
				}
			};
			
			document.getElementsByTagName("head")[0].appendChild(script);
		}
	},

	/**
	 * initialize the page
	 * 
	 * this will call some more special prepare fucntions
	 */
	init: function() {

		extendedRedmine.userSelectHelper.prepareAssignedTo();

		/**
		 * Add an ajaxSuccess handle, so we can re-modify the page, after
		 * redmine has modified it via an ajax call.  This happens especially
		 * if either the project or the issue status are changed.
		 */
		$(document).ajaxSuccess(function() {
			if(!$("#issue_assigned_to_id ~ a:contains('edit')").length) {
				/* edit link was removed, re-modify */
				extendedRedmine.userSelectHelper.prepareAssignedTo();
			}
		});
	},
	
	/**
	 * this will allow the user to select users he/she wants to be on top of the assign-to list
	 */
	userSelectHelper : {
		/**
		 * prepare the assign-to select.
		 * this will find options the user has selected 
		 * and clone them to the top of the select
		 */
		prepareAssignedTo : function() {
			var $assignedSelect = jQuery('#issue_assigned_to_id');
			
			if($assignedSelect.length == 0)
			{
				return;
			}

			$assignedSelect.after(jQuery('<a>',{	href:'#',
											 		text: ' edit',
											 		click: extendedRedmine.userSelectHelper.askForTopUsers	}));

			var topItems = extendedRedmine.userSelectHelper.getStoredTopItems();

			if(!topItems)
			{
				localStorage.removeItem("topUsers");
				extendedRedmine.userSelectHelper.askForTopUsers();
			}

			var newItems = [];
			
			jQuery.each(topItems, function(i, e){
				newItems.push( jQuery('option[value="'+e+'"]', $assignedSelect).clone().addClass('generated') );
			});

			if(newItems.length > 0)
			{
				newItems.push(jQuery('<option>', {text: '--------------------------', 'class':'generated'}));
			}
			$assignedSelect.prepend(newItems);
		},
		
		/**
		 * shows a dialog to let the user select entries
		 */
		askForTopUsers : function(e) {
			if(typeof e != 'undefined')
			{
				e.preventDefault();
			}

			var htmlContent = '<label for="">Bitte wählen Sie die Nutzer, die oben gelistet werden sollen</label><br><select></select><br><button id="saveusers">speichern</button>';
			var $dialogContent = jQuery('<div>', {
				id: 'userselection',
				html : htmlContent
			});
			
			$userselect = jQuery('#issue_assigned_to_id')
				.clone()
				.find('.generated')
					.remove()
				.end();
			
			$userselect.prop('multiple', true)
						.prop('size', 10)
						.prop('id', 'userselect')
						.css({'width': '90%'});
			jQuery('option:selected', $userselect).prop('selected', false);

			var currentTopItems = extendedRedmine.userSelectHelper.getStoredTopItems();

			if(currentTopItems)
			{
				jQuery.each(currentTopItems, function(i, e){
					jQuery('option[value="'+e+'"]', $userselect).prop('selected', true);
				});
			}
			
			jQuery('select', $dialogContent).replaceWith($userselect);
			$dialogContent.dialog();
			
			jQuery('#saveusers').click(extendedRedmine.userSelectHelper.store);
		},
		
		/**
		 * save the userselection
		 */
		store : function() {
			var selected = jQuery('#userselect').val();
			var newTopItems = [];
			if(selected.length > 0)
			{
				newTopItems = JSON.stringify(selected);
			}
			
			localStorage.setItem("topUsers", newTopItems);
			jQuery('#userselection').dialog('destroy');
		},

		/**
		 * fetch selected topItems from local storage
		 *
		 * this returns false if nothing is in localStorage,
		 * its no JSON or no Array/Object in JSON
		 *
		 * @return {bool|object}
		 */
		getStoredTopItems : function() {
			var topItems = localStorage.getItem("topUsers");

			if(!topItems)
			{
				return false;
			}

			if(!IsJsonString(topItems))
			{
				return false;
			}

			topItems = JSON.parse(topItems);

			if(typeof topItems != 'array' && typeof topItems != 'object')
			{
				return false;
			}

			return topItems;
		}
	}
};

function IsJsonString(str) {
	try {
		JSON.parse(str);
	} catch (e) {
		return false;
	}
	return true;
}
 
extendedRedmine.prepare();
