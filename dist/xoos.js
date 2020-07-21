/*
 @Xoos.js v0.0.1
 @author : Habibe BA  
 @date : 20-07-2020  23:00
 @Licensed under the MIT.

*/


(function() {
  'use strict';
  /**
     * @namespace Xoos
     */
 

  var PI_OVER_180 = Math.PI / 180;
  
  var Xoos = {
    // public
    version: '1.0.0',
    config : {},
    _iXoos: {
      
      container : null, 
      w : 600, 
      h : 400,
      layers: []
    
    }, //the Xoos instance
    shapes: [],
    
    ns    : 'http://www.w3.org/2000/svg',
    xmlns : 'http://www.w3.org/2000/xmlns/',
    xlink : 'http://www.w3.org/1999/xlink',
    dragging : false /*Whether mouse is moving after a mouseDown event*/


   }
  var _global =
    typeof global !== 'undefined'
      ? global
      : typeof window !== 'undefined'
        ? window
        : typeof WorkerGlobalScope !== 'undefined' ? self : {};


  if (_global.Xoos) {
    console.error(
      'Xoos instance already exists in current environment. ' +
       'Unique instance is allowed.'
    );
  }
  _global.Xoos = Xoos;
  Xoos.global = _global;
  Xoos.window = _global;
  Xoos.Doc = _global.document || window.document;

  if (typeof exports === 'object') {
    module.exports = Xoos;
  } else if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define(function() {
      return Xoos;
    });
  }
})();



(function() {
  'use strict';

  /**
     * Shapes Collection constructor.  Shapes Collection extends
     * @constructor
     * @memberof Xoos
     */
  Xoos.shapes = function() {
    return this.shapes;
  };

  Xoos.shapes.prototype = [];


  
  Xoos.Utils = {
     
       debugHead: function () {

        var v = Xoos.version;
        var r = 'SVG Drawing';
        var a = 'JS framework';
        var c = 1;

       if (window.navigator.appName == "Netscape")
        {
            var args = [
                '%c %c %c Xoos v' + v + ' - ' + r + ' - ' + a + '  %c %c ' + ' http://xoos.github.com  %c %c ♥%c♥%c♥ ',
                'background: #0cf300',
                'background: #00bc17',
                'color: #ffffff; background: #00711f;',
                'background: #00bc17',
                'background: #0cf300',
                'background: #00bc17'
            ];

            for (var i = 0; i < 3; i++)
            {
                if (i < c)
                {
                    args.push('color: #ff2424; background: #fff');
                }
                else
                {
                    args.push('color: #959595; background: #fff');
                }
            }

            console.log.apply(console, args);
        }
        else
        {
            console.log('Xoos v' + v + ' - with ♥%c ');
        }

    },

     createElement : function(_name)
     {
       var name = _name.toLowerCase(); //Rect => rect
       
       var element = Xoos.Doc.createElementNS(Xoos.ns, name)
       return element;

     },
     add : function(Objects)
     {  
       for (var i = 0; i < Objects.length; i++) 
        {
           var element = Objects[i].el;
           Xoos.svgDoc.appendChild(element);
           // console.log(Objects[i].el)
        }
     },
     attrs : function(object, attrs)
     {
         if(!attrs) //Return el attrs
         {
           return object.el.initialization;
         }

         var _item = object.el ;
         object.el.initialization = attrs; //Setting inint values
         var attrs_names = Object.getOwnPropertyNames(attrs);
         for (var i = 0; i < attrs_names.length; i++)
          {
             var attr_value = attrs[attrs_names[i]];

            _item.setAttribute(attrs_names[i], attr_value);

          }

     },
     /*Get last object's attrs when animation is applied on it*/
     attrs_anim : function(object)
     {
          
         var _item = object.el ;
         var attrs = {};

         var attrsmap = _item.attributes;
          
         for (var i = 0; i < attrsmap.length; i++)
          {
             var attr_name = attrsmap.item(i).name;
             var attr_value = attrsmap.item(i).value;
             if (!isNaN(attr_value))
                attr_value = parseFloat(attr_value, 10);
             attrs[attr_name] = attr_value;

          }

        return attrs;

     },

     isColor : function(attr)
     {
        return attr === 'fill' || attr === 'stroke' ? true : false;
     },
     rgb : function(color)
      {
          /*Creates a fake rect, assigns it the given color
           and return computedColor : in RGB
           @Return : RGB Array*/
          var r = 0 , g = 0 , b = 0;

          var fakeRect = document.createElementNS(Xoos.ns, 'rect');
          fakeRect.setAttribute('fill', color);
          Xoos.svgDoc.appendChild(fakeRect);
          var rgb = window.getComputedStyle(fakeRect, null).getPropertyValue('fill');
          //Remove from svg docum
          Xoos.svgDoc.removeChild(fakeRect);

          rgb = rgb.replace(/[^\d,]/g, '').split(',');
          rgb.forEach(function(col , i){ /*Converts into integer**/

            rgb[i] = parseInt(col,10);

          })

          return rgb;
       },

       animexcept : {

             attrs : function(error)
             {
                var args = [
                '%c %c %c '+error+' %c %c %c',
                'background: #800000',
                'background: #d40000',
                'color: #ffffff; background: #ff0000;',
                'background: #d40000',
                'background: #800000'
                ];
                console.log.apply(console, args);
             }

       }

  } //Utils
  
  Xoos.Utils.debugHead()
  Xoos.FPS = 60;
  Xoos.Easing = {
      
      linear :function(t, b, c, d)
      {
        return -c * ((t=t/d-1)*t*t*t - 1) + b;
      },
      swing: function (t, b, c, d) {
        return Xoos.Easing.easeOutQuad(t, b, c, d);
      },
      easeInQuad: function (t, b, c, d) {
        return c*(t/=d)*t + b;
      },
      easeOutQuad: function (t, b, c, d) {
        return -c *(t/=d)*(t-2) + b;
      },
      easeInOutQuad: function (t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t + b;
        return -c/2 * ((--t)*(t-2) - 1) + b;
      },
      easeInCubic: function (t, b, c, d) {
        return c*(t/=d)*t*t + b;
      },
      easeOutCubic: function (t, b, c, d) {
        return c*((t=t/d-1)*t*t + 1) + b;
      },
      easeOutCubicElastic : function(t, b, c, d) {
          
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
      },
      easeInOutCubic: function (t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t + b;
        return c/2*((t-=2)*t*t + 2) + b;
      },
      easeInQuart: function (t, b, c, d) {
        return c*(t/=d)*t*t*t + b;
      },
      easeOutQuart: function (t, b, c, d) {
        return -c * ((t=t/d-1)*t*t*t - 1) + b;
      },
      easeInOutQuart: function (t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t + b;
        return -c/2 * ((t-=2)*t*t*t - 2) + b;
      },
      easeInQuint: function (t, b, c, d) {
        return c*(t/=d)*t*t*t*t + b;
      },
      easeOutQuint: function (t, b, c, d) {
        return c*((t=t/d-1)*t*t*t*t + 1) + b;
      },
      easeInOutQuint: function (t, b, c, d) {
        if ((t/=d/2) < 1) return c/2*t*t*t*t*t + b;
        return c/2*((t-=2)*t*t*t*t + 2) + b;
      },
      easeInSine: function (t, b, c, d) {
        return -c * Math.cos(t/d * (Math.PI/2)) + c + b;
      },
      easeOutSine: function (t, b, c, d) {
        return c * Math.sin(t/d * (Math.PI/2)) + b;
      },
      easeInOutSine: function (t, b, c, d) {
        return -c/2 * (Math.cos(Math.PI*t/d) - 1) + b;
      },
      easeInExpo: function (t, b, c, d) {
        return (t==0) ? b : c * Math.pow(2, 10 * (t/d - 1)) + b;
      },
      easeOutExpo: function (t, b, c, d) {
        return (t==d) ? b+c : c * (-Math.pow(2, -10 * t/d) + 1) + b;
      },
      easeInOutExpo: function (t, b, c, d) {
        if (t==0) return b;
        if (t==d) return b+c;
        if ((t/=d/2) < 1) return c/2 * Math.pow(2, 10 * (t - 1)) + b;
        return c/2 * (-Math.pow(2, -10 * --t) + 2) + b;
      },
      easeInCirc: function (t, b, c, d) {
        return -c * (Math.sqrt(1 - (t/=d)*t) - 1) + b;
      },
      easeOutCirc: function (t, b, c, d) {
        return c * Math.sqrt(1 - (t=t/d-1)*t) + b;
      },
      easeInOutCirc: function (t, b, c, d) {
        if ((t/=d/2) < 1) return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
        return c/2 * (Math.sqrt(1 - (t-=2)*t) + 1) + b;
      },
      easeInElastic: function (t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return -(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
      },
      easeOutElastic: function (t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d)==1) return b+c;  if (!p) p=d*.3;
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        return a*Math.pow(2,-10*t) * Math.sin( (t*d-s)*(2*Math.PI)/p ) + c + b;
      },
      easeInOutElastic: function (t, b, c, d) {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
      },
      easeInBack: function (t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c*(t/=d)*t*((s+1)*t - s) + b;
      },
      easeOutBack: function (t, b, c, d, s) {
        if (s == undefined) s = 1.70158;
        return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
      },
      easeInOutBack: function (t, b, c, d, s) {
        if (s == undefined) s = 1.70158; 
        if ((t/=d/2) < 1) return c/2*(t*t*(((s*=(1.525))+1)*t - s)) + b;
        return c/2*((t-=2)*t*(((s*=(1.525))+1)*t + s) + 2) + b;
      },
      easeInBounce: function (t, b, c, d) {
        return c - jQuery.easing.easeOutBounce (d-t, 0, c, d) + b;
      },
      easeOutBounce: function (t, b, c, d) {
        if ((t/=d) < (1/2.75)) {
          return c*(7.5625*t*t) + b;
        } else if (t < (2/2.75)) {
          return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
        } else if (t < (2.5/2.75)) {
          return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
        } else {
          return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
        }
      },
      easeInOutBounce: function (t, b, c, d) {
        if (t < d/2) return Xoos.Easing.easeInBounce (t*2, 0, c, d) * .5 + b;
        return Xoos.Easing.easeOutBounce (t*2-d, 0, c, d) * .5 + c*.5 + b;
      }

  }
  
  /************ Xoos.SCENE ************/

  /**
     * scene constructor.   
     * Create a new canvas
     * @constructor
     * @memberof Xoos
     */

  Xoos.scene = function(elId, w, h ) {

     this.w = w || Xoos._iXoos.w;
     this.h = h || Xoos._iXoos.h;
     this.container = null;
     this.layers = [];
     this.activeLayer = null;

     var args = arguments;
     var container = Xoos.Doc.getElementById(elId) || document.body;
     if(container !== undefined && container !== null)
     {

         this.container = container;

         Xoos._iXoos = this;

     }
     else
     {
      console.error("Provided HTMLElement doesn\'t exist ! ");
     }
      Xoos.this = this;

      return this;

  };

  Xoos.scene.prototype = {

     add : function(_layer)
      { 
        var layerId = "Xoos_layer_" + (this.layers.length + 1);
        _layer._id = layerId;
        _layer._svg.setAttribute("id", layerId);

        var layerSvgDoc = _layer._svg; 
        Xoos._iXoos.container.appendChild(layerSvgDoc);
        this.layers.push(_layer);

        this.setActiveLayer(_layer);
      },

      setActiveLayer : function(_layer)
      {
        this.activeLayer = _layer;
      }
       

  }



    /**
     * scene constructor.   
     * Create a new canvas
     * @constructor
     * @memberof Xoos
     */

    Xoos.layer = function() {
      var args = arguments;
      this._id = null;
      this._svg = null;
    
      this._svg = Xoos.Utils.createElement("svg");
      this._svg.classList = 'Xoos_layer';
      this._svg.style.backgroundColor = '#f2f2f2';
      var svgW = Xoos._iXoos.w || '100%';
      var svgH = Xoos._iXoos.h || '100%';

      this._svg.style.position = "absolute";
      this._svg.style.top = "0px";
      this._svg.style.left = "0px";
      this._svg.setAttribute('width', svgW)  ;
      this._svg.setAttribute('height', svgH) ;

      return this;
 
   };
 

  Xoos.extend = function(child, ch_proto, parent)
  {

      function Ctor() {
        this.constructor = child;
      }
      Ctor.prototype = parent.prototype;
      var oldProto = ch_proto; //In Temp
      child.prototype = new Ctor(); //New assignation
      for (var key in oldProto) {
        if (oldProto.hasOwnProperty(key)) {
          child.prototype[key] = oldProto[key];
        }
      }
      child.__super__ = parent.prototype;
      // create reference to parent
      child.super = parent;

  } 

  Xoos.invent = function(config)
  {
      var invention = config.invention;

      Xoos[invention] = function(config)
      {
         //Code goes here 
         return this.create(invention, config);
      }

      Xoos.extend(Xoos[invention], config.extend, config.inherit);

      return Xoos[invention];

  }

  Xoos.Object = function()
  {
     this.active = true;
     this.visible = true;
     this.type = 'object';
     this.el = null;
  }

  Xoos.Object.prototype = {

     create : function(name, attrs)
     {

         this.el = Xoos.Utils.createElement(name);
         this.attrs(attrs);
         return this;
     },
     attrs : function(attrs)
     {
         Xoos.Utils.attrs(this, attrs);
     },
     add : function() 
     {

     },
     animate : function(animation, opts)
     {
        var _selfobj = this;

        if (animation instanceof Xoos.animation) 
        {

          var dur = animation.state.duration;
          var easing = animation.state.easing;
          var delay = animation.state.delay;

          if ((typeof opts !== null) && (typeof opts === 'object')) 
            {
              dur = opts.duration;
              easing = opts.easing;
              delay = opts.delay;
            }

           /******** Animating section********/
             
             //attrs of Given Object at animate() call : Updated attrs
             var srcArray = Xoos.Utils.attrs_anim(_selfobj);
             var animArray = animation.state.animation; //Destination attrs of Given Object:Final values of animation 
             var currentIteration = 0;
             var totalIterations = dur * Xoos.FPS;
             var newAnimArray = srcArray;

             var refnewCurrentValue ;
             var refEndpoint ;
 

             var animatic = function(){
                  
                 

                 var attrs_names = Object.getOwnPropertyNames(animArray);

                 attrs_names.forEach(function(attr_name, index){
                     
                     if(Xoos.Utils.isColor(attr_name))
                     {
                         
                        var rgbStart = Xoos.Utils.rgb(srcArray[attr_name]);
                        var rgbEnd = Xoos.Utils.rgb(animArray[attr_name]);
                         
                        var rgbNew = [];
                        rgbNew = rgbStart;
                      

                        for (var i = 0; i < 3; i++) {

                             var endpoint = rgbEnd[i];
                             var startpoint = rgbStart[i];
 
                             var changeInValue = endpoint - startpoint;

                             var currentValue = easing(currentIteration, startpoint, changeInValue , totalIterations);
                             rgbNew[i] = currentValue;
                              
                              _selfobj.el.setAttribute(attr_name, 'rgb('+rgbNew[0]+','+rgbNew[1]+','+rgbNew[2]+')');

                            }

                     }
                     else
                     { 

                         var endpoint = animArray[attr_name];
                         var startpoint = srcArray[attr_name];

                         var changeInValue = endpoint - startpoint;

                         var currentValue = easing(currentIteration, startpoint, changeInValue , totalIterations);
                         
                          _selfobj.el.setAttribute(attr_name, currentValue);
                     }

                })


                  currentIteration++;

                  if (currentIteration > totalIterations) 
                    return;

                  requestAnimationFrame(animatic);

             }//End animatic
             

           /**********************************/

                 animatic();

           /**********************************/


        }
        else //Leave
        { 
          Xoos.animexcept.attrs('First argument is not instance of Xoos.animation');
          return ;
        }
     }

  }

 Xoos.invent({

      invention : 'rect',

      inherit : Xoos.Object,

      extend : {
       
        _pull : function()
        {

        },
        _size : function(w,h)
        {

        }

      }//extend

 })
 

  Xoos.animation = function(attrs = null, duration = 1, delay = 0, easing = Xoos.Easing.linear)
  {
     this.active = true;
     this.type = 'animation';
     this.state = [];
     this.state.animation = null;
     this.state.progress = null;
     this.state.duration = duration; //Default 1s
     this.state.delay = delay; //
     this.state.easing = easing ; //
     this.state.callback = null; //
     this.paused = true;
     this.ended = null;

     this.create(attrs);

  }


  Xoos.animation.prototype = {

     create : function(attrs)
     {
        if((typeof attrs !== null) && (typeof attrs === 'object'))
        {  
           if (this.state.animation) 
            {
                var attrs_names = Object.getOwnPropertyNames(attrs);
                for (var i = 0; i < attrs_names.length; i++)
                {
                   var attr_value = attrs[attrs_names[i]];

                   this.state.animation[attrs_names[i]] = attr_value;
                   this.state.progress[attrs_names[i]] = attr_value;

                }
            }
            else
            {
              this.state.animation = attrs;
              this.state.progress = attrs;
            }
          
        }
        else
        {
          Xoos.Utils.animexcept.attrs('Error on provided arguments for Animation');
        }
         
     },
     attrs: function(attrs)
     {
       if (!attrs)
        {
            return this.state.animation;
        }
       else
        {
          
          this.create(attrs);
           
        }

     }, 
     duration: function(duration)
     {
       if (!duration)
        {
            return this.state.duration;
        }
       else
        {
         if(typeof duration === 'number')
          {
             this.state.duration = duration;
          }
           
        }
     },
     delay: function(delay)
     {
         if (!delay)
          {
              return this.state.delay;
          }
         else
          {
           if(typeof delay === 'number')
            {
               this.state.delay = delay;
            }
             
          }
     },
     play : function()
     {

     },
     pause : function()
     {

     },
     end: function()
     {

     }




  }
 
// var r = new Xoos.Rect({});

// console.log(r)
  

})(Xoos);

