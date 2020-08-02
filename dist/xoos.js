/*
 @Xoos.js v0.0.1
 @author : Habibe BA  (Shadoworker)
 @date : 20-07-2020  23:00
 @Licensed under the MIT.

*/

(function() {
  'use strict';
  /**
  * @namespace Xoos
  */
 

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
    ns    : 'http://www.w3.org/2000/svg',
    xmlns : 'http://www.w3.org/2000/xmlns/',
    xlink : 'http://www.w3.org/1999/xlink',

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
   * Xoos Utils
   * @memberof Xoos
   */
  
  Xoos.Utils = {
     
       debugHead: function () {

        var v = Xoos.version;
        var r = 'SVG Drawing - ';
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
     }

  } //Utils
  
  // Call debug
  Xoos.Utils.debugHead()


  /**
   * SVGPoint prototype
   * @memberof SVGPoint
   */

    SVGPoint.prototype.eq = function (that) 
    {
      return (this.x === that.x && this.y === that.y);
    };

    SVGPoint.prototype.lerp = function (svg, that, t) 
    {
      
      if (typeof t === 'undefined') 
      {
          t = 0.25;
      }
      
      t = Math.max(Math.min(1, t), 0);
      var p = svg.createSVGPoint();
      
      p.x = (this.x + (that.x - this.x) * t); 
      p.y = (this.y + (that.y - this.y) * t);

      return p;
    };

    SVGPoint.prototype.midPointFrom = function (svg, that) 
    {
      return this.lerp(svg, that);
    };


  /**** SVGPoint prototype end **** */
  
  /************ Xoos.SCENE ************/

  /**
     * scene constructor.   
     * Create a new drawing canvas (svg)
     * @constructor
     * @memberof Xoos
     */

  Xoos.scene = function(elId, w, h ) {

      this.w = w || Xoos._iXoos.w;
      this.h = h || Xoos._iXoos.h;
      this.container = null;
      this.layers = [];
      this.activeLayer = null;

      // Drawing presets 
      this._lineBaseWidth = 1;
      this._endPoint = null;
      this._points = [];
      this._isDrawing = false;
      this._pathElement = null;
      this._color = "black";
      this._d = "";

      //--------------------

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
      },

      _addPoint: function(point) 
      {
          if (this._points.length > 1 && point.eq(this._points[this._points.length - 1])) {
              return false;
          }
          this._points.push(point);
          return true;
      },
      
      _reset: function() 
      {
          this._points = [];
          this._d = "";
      },

      _initDrawing : function(point)
      {
        
          this._reset();
          this._addPoint(point);
          
      },

      _capturePoint : function(point)
      {
          return this._addPoint(point);
      },

      _drawSegment : function(p1, p2)
      {
          var midPoint = p1.midPointFrom(this.activeLayer._svg, p2);
          
          this._d = this._d + "Q"+ p1.x + "," + p1.y + " " + midPoint.x + "," + midPoint.y + " ";

          this._setPath(this._d);

          return midPoint;

      },

      _setPath : function()
      {
          this._pathElement.setAttribute("d" , this._d);
      },

      setColor : function(color)
      {
          this._color = color;
      },

      _draw : function()
      {

          var i, len,
          p1 = this._points[0],
          p2 = this._points[1];

          // Dispatch the captured similar point into two by spacing their x Axis 
          // so we can draw a dot
          if (this._points.length === 2 && p1.x === p2.x && p1.y === p2.y) 
          {
              var width = this._lineBaseWidth / 1000;

              var p1p = this.activeLayer._svg.createSVGPoint();
              p1p.x = p1.x; p1p.y = p1.y;
              p1 = p1p;

              var p2p = this.activeLayer._svg.createSVGPoint();
              p2p.x = p2.x; p2p.y = p2.y;
              p2 = p2p;

              // Update x values 
              p1.x -= width;
              p2.x += width;
          }

          this._d = this._d + "M"+ p1.x + "," + p1.y + " ";
          this._setPath();
          
          for (i = 1, len = this._points.length; i < len; i++) 
          {
              // The midpoint of (pi + 1) & (pi + 2) will be our endpoint
              // And p1 our control point
              
              this._drawSegment(p1, p2);
              p1 = this._points[i];
              p2 = this._points[i + 1];
              
          }
          // End with a straigth line
          this._d = this._d + "L"+ p1.x + "," + p1.y + " " ;
          this._setPath();


      },

      _onMouseDown : function()
      {
          this.activeLayer._svg.addEventListener("mousedown", (e) =>{
          

              this._isDrawing = true;

              // Creating the current path element to be drawn
              this._pathElement = Xoos.Utils.createElement("path");
              this._pathElement.setAttribute("fill", "none");
              this._pathElement.setAttribute("stroke", this._color);
              this._pathElement.setAttribute("stroke-width", 3);
              this._pathElement.setAttribute("stroke-linejoin", "round");
              this._pathElement.setAttribute("stroke-linecap", "round");
              
              this.activeLayer._svg.appendChild(this._pathElement);

              // Creating a SVGPoint instance
              var point = this.activeLayer._svg.createSVGPoint();
              point.x = e.clientX;
              point.y = e.clientY;
              var t = point.matrixTransform(this.activeLayer._svg.getScreenCTM().inverse());
              
              // console.log(t);

              // Very first pointer capture
              this._initDrawing(t);
              // Capture current point to draw a dot 
              this._capturePoint(t);
              // Draw
              this._draw();

          });

        

      },

      _onMouseMove : function()
      {
          this.activeLayer._svg.addEventListener("mousemove", (e) =>{
              
            if(this._isDrawing)
            {

                var point = this.activeLayer._svg.createSVGPoint();
                point.x = e.clientX;
                point.y = e.clientY;
                var t = point.matrixTransform(this.activeLayer._svg.getScreenCTM().inverse());

                if (this._capturePoint(t) && this._points.length > 1) 
                {

                    var points = this._points, length = points.length;
                   
                    // draw Quadratic curve
                    
                    if (this._endPoint) 
                    {
                      this._d = this._d + "M"+ this._endPoint.x + "," + this._endPoint.y + " ";
                      this._setPath();
                    }

                    this._endPoint = this._drawSegment(points[length - 2], points[length - 1], true);
                    
                }
            
            }
              
          })
      },

      _onMouseUp : function()
      {
        this.activeLayer._svg.addEventListener("mouseup", (e) =>{

              this._endPoint = undefined;
              this._isDrawing = false;
              return false;
          })

      },

      // Canvas initializer
      draw : function()
      {
          this._onMouseDown();
          this._onMouseMove();
          this._onMouseUp();

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
 
 
 

  

})(Xoos);

