/**
*	@name							Valid8
*	@descripton						An input field validation plugin for Jquery
*	@version						1.3
*	@requires						Jquery 1.3.2+
*
*	@author							Jan Jarfalk
*	@author-email					jan.jarfalk@unwrongest.com
*	@author-website					http://www.unwrongest.com
*
*	@licens							MIT License - http://www.opensource.org/licenses/mit-license.php
*/

(function ($) {

	$.valid8 = {
		state: {}
	};
	
    $.fn.extend({

        valid8: function (options) {
			
			var collection = this;
			
            return collection.each(function ( index ) {

                $(this).data('valid', false);
				
				function S4() { return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
}
				function guid() { return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4()); }

				
                var defaultOptions = {
                    regularExpressions: [],
                    ajaxRequests: [],
                    jsFunctions: [],
                    validationEvents: ['keyup'],
                    validationFrequency: 550,
                    values: null,
                    defaultErrorMessage: 'Required',
                    guid: guid()
                };
                
                if (typeof options == 'string')
                    defaultOptions.defaultErrorMessage = options;

                if (this.type == 'checkbox') {
                    defaultOptions.regularExpressions = [{ expression: /^true$/, errormessage: defaultOptions.defaultErrorMessage}];
                    defaultOptions.validationEvents = ['click'];
                } else if(this.type == 'select-one' || this.type == 'select-multiple'){
                	defaultOptions.regularExpressions = [{ expression: /^.+$/, errormessage: defaultOptions.defaultErrorMessage}];
                	defaultOptions.validationEvents = ['change'];
                } else {
                    defaultOptions.regularExpressions = [{ expression: /^.+$/, errormessage: defaultOptions.defaultErrorMessage}];
				}
				
                $(this).data('settings', $.extend(defaultOptions, options));
				
				if( collection.length-1 == index ) {
					$(this).data('end', true);
                }
                
                $.valid8.state[$(this).data('settings')['guid']] = 'init';
                
                initialize(this);
                    
            });
        },

        isValid: function ( options ) {
			
            var valid = true;
            this.each(function (index, element) {

                validate( element );
                if ($( element ).data('valid') == false) {
                    valid = false;
               	}
               	
            });
            
            return valid;
        }

    });

    function initializeDataObject(el) {
        $(el).data('loadings', new Array());
        $(el).data('errors', new Array());
        $(el).data('valids', new Array());
        $(el).data('keypressTimer', null);
    }

    function initialize( element ) {
    
        initializeDataObject( element );

        if ($( element ).attr('value').length > 0 && element.type != 'checkbox') {
        	validate( element );
        } else {
        	$.valid8.state[$(element).data('settings')['guid']] = 'loaded'
        }
        
        activate( element );
        
    };

    function activate( element ) {
        var events = $( element ).data('settings').validationEvents;
        if (typeof events == 'string')
            $( element )[events](function (e) { handleEvent( e, element ); });
        else {
            $.each(events, function (i, event) {
                $( element )[event](function (e) { handleEvent( e, element ); });
            });
        }
        
    };

    function validate( element ) {
    
        // Dispose old errors and valids
        initializeDataObject( element );

        var value;
		
        // Handle checkbox
        if (element.type == 'checkbox') {
            value = element.checked.toString();
        } else if(element.type == 'select-one'){
       		value = element.value;
        } else {
            value = element.value;
		}
		
        regexpValidation(value.replace(/^[ \t]+|[ \t]+$/, ''), element);
    };

    function regexpValidation(value, el) {

        $.each($(el).data('settings').regularExpressions, function (i, validator) {

            if (!validator.expression.test(value)){
                $(el).data('errors')[$(el).data('errors').length] = validator.errormessage;
            } else if (validator.validmessage)
                $(el).data('valids')[$(el).data('valids').length] = validator.validmessage;
        });

        if ($(el).data('errors').length > 0)
            onEvent(el, { 'valid': false });
        else if ($(el).data('settings').jsFunctions.length > 0) {
            functionValidation(value, el);
        }
        else if ($(el).data('settings').ajaxRequests.length > 0) {
            fileValidation(value, el);
        }
        else {
            onEvent(el, { 'valid': true });
        }

    };

    function functionValidation(value, el) {

        $.each($(el).data('settings').jsFunctions, function (i, validator) {

            var v;
            if (validator.values) {
                if (typeof validator.values == 'function')
                    v = validator.values();
            }

            var values = v || value;

            handleLoading(el, validator);

            if (validator['function'](values).valid)
                $(el).data('valids')[$(el).data('valids').length] = validator['function'](values).message;
            else
                $(el).data('errors')[$(el).data('errors').length] = validator['function'](values).message;
        });

        if ($(el).data('errors').length > 0)
            onEvent(el, { 'valid': false });
        else if ($(el).data('settings').ajaxRequests.length > 0) {
            fileValidation(value, el);
        }
        else {
            onEvent(el, { 'valid': true });
        }
    };

    function fileValidation(value, el) {


        $.each($(el).data('settings').ajaxRequests, function (i, validator) {

            var v;
            if (validator.values) {
                if (typeof validator.values == 'function')
                    v = validator.values();
            }

            var values = v || { value: value };

            handleLoading(el, validator);
			
			$.ajax({
			  type: 'GET',
			  url: validator.url,
			  data: values,
			  dataType: 'json',
			  success: function(data, textStatus){
			  	
			  	if (data.valid) {
			          $(el).data('valids')[$(el).data('valids').length] = data.message || validator.validmessage || "";
			      } else {
			          $(el).data('errors')[$(el).data('errors').length] = data.message || validator.errormessage || "";
			      }
			      if ($(el).data('errors').length > 0){
			          onEvent(el, data);
			      } else {
			          onEvent(el, data);
			      }
			  	
			  }
			});

        });

    };

    function handleEvent(e, el) {
        if (e.keyCode && $(el).attr('value').length > 0) {
            clearTimeout($(el).data('keypressTimer'));
            $(el).data('keypressTimer', setTimeout(function () {
                validate(el);
            }, $(el).data('settings').validationFrequency));
        }
        else if (e.keyCode && $(el).attr('value').length <= 0)
            return false;
        else {
            validate(el);
        }
    };

    function handleLoading( element, validator ) {

        if (validator.loadingmessage) {
            $( element ).data('loadings')[$( element ).data('loadings').length] = validator.loadingmessage;
        }
        
        onEvent(element, { 'valid': null });
        
    };

    function onEvent(el, response) {

        if (response.valid === true) {
            messages = $(el).data('valids');
            $(el).data('valid', response.valid);
            $(el).trigger('valid', [response, el]);         
        } else if (response.valid === false) {
            messages = $(el).data('errors');
            $(el).data('valid', response.valid);
            $(el).trigger('error', [response, el]);   
        } else {
            messages = $(el).data('loadings');
            $(el).trigger('loading', [response, el]);
        }
		
        if ( $.valid8.state[$(el).data('settings')['guid']] === 'loaded' ) {
        	setParentClass(el, response.valid);
            setMessage(messages, el);
        }
        
        if(response.valid === true || response.valid === false){
        	if($(el).data('end')){
            	$.valid8.state[$(el).data('settings')['guid']] = 'loaded';
            }
        }
        
    }

    function setParentClass(el, valid) {
        var className = (valid) ? 'valid' : 'error';
        if(valid == null){
    		className = 'loading';
    	}
        var parent = $(el).closest('p');
        parent[0].className = (parent[0].className.replace(/(^\s|(\s*(loading|error|valid)))/g, '') + ' ' + className).replace(/^\s/, '');
    }

    function setMessage(messages, el) {
        var parent = $(el).parent();
        var elementId = el.id + "ValidationMessage";
        var elementClass = 'validationMessage';
        if (!$('#' + elementId).length > 0) {
            parent.append('<span id="' + elementId + '" class="' + elementClass + '"></span>');
        }

        $('#' + elementId).html("");
        $('#' + elementId).text(messages[0]);
        
    };

})(jQuery);