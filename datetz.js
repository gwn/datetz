/*
 * DateTz
 *   A localized Date object. Kind of. Not a subclass of Date,
 *   but a wrapper that has the same accessors. At least getters,
 *   for now.
 *
 * @param array date_params
 *   A parameter list similar to the Date object's argument list.
 *
 * @param number offset_hour
 *   Offset from UTC in hours, before DST offset (if applicable)
 *
 * @param bool dst_enabled
 *   Is daylight savings time applicable?
 *   Optional, defaults to true.
 *
 * @param object dst_start
 *   Time of the year when DST starts. (inclusive)
 *   Optional, defaults to {mon: 2, day: 29, hour: 3}
 *
 * @param object dst_end
 *   Time of the year when DST ends. (exclusive)
 *   Optional, defaults to {mon: 9, day: 25, hour: 4}
 */
var DateTz = function(date_params, offset_hour, dst_enabled,
                      dst_start, dst_end)
{
  var epoch_tz;

  offset_hour = offset_hour || 0;
  dst_enabled = dst_enabled || typeof dst_enabled === 'undefined';
  dst_start   = dst_start   || {mon: 2, day: 29, hour: 3};
  dst_end     = dst_end     || {mon: 9, day: 25, hour: 4};

  this.base_offset = offset_hour * 36e5;


  switch (date_params.length) {
    case 0:
      epoch_tz = Date.now() + this.base_offset;
      break;

    case 1:
      if (typeof date_params[0] == 'string') {
        console.error('Date strings are not supported yet ' +
                        'on DateTz constructors!');
        return null;
      }

      if (typeof date_params[0] == 'number')
        epoch_tz = date_params[0] + this.base_offset;

      break;

    default:
      epoch_tz = Date.UTC.apply(window, date_params);
  }

  this.is_dst =
    dst_enabled &&
      DateTz.isDST(epoch_tz, this.base_offset, dst_start, dst_end);

  if (!date_params.length || typeof date_params[0] == 'number')
    epoch_tz += Number(this.is_dst) * 36e5;

  this.date = new Date(epoch_tz);
};


DateTz.createFactory = function(offset_hour, dst_enabled, dst_start, dst_end) {
  return function() {
    return new DateTz(arguments, offset_hour, dst_enabled, dst_start, dst_end);
  };
};


DateTz.isDST = function(epoch_tz, base_offset, dst_start, dst_end) {
  var this_year_dst_start = Date.UTC(new Date(epoch_tz).getUTCFullYear(),
                                     dst_start.mon,
                                     dst_start.day,
                                     dst_start.hour) + base_offset;

  var this_year_dst_end = Date.UTC(new Date(epoch_tz).getUTCFullYear(),
                                   dst_end.mon,
                                   dst_end.day,
                                   dst_end.hour) + base_offset;

  return epoch_tz >= this_year_dst_start && epoch_tz < this_year_dst_end;
};


// Setup accessors
(function() {
  var i,
      accessor,
      accessors = ['FullYear', 'Month', 'Date', 'Hours',
                   'Minutes', 'Seconds', 'Milliseconds',
                   'Day'];

  // for loop with a hack for block level scopes
  for (i = -1; ++i < accessors.length; ) (function(i) {
    var accessor = accessors[i];

    DateTz.prototype['get' + accessor] = function() {
      return this.date['getUTC' + accessor]();
    };

    DateTz.prototype['getUTC' + accessor] = function() {
      return new Date(+this.date - this.getTimezoneOffset())['getUTC' + accessor]();
    };

    // TODO
    DateTz.prototype['set' + accessor] =
      DateTz.prototype['setUTC' + accessor] =
        function() {
          console.error('"set.." methods on DateTz objects ' +
                          ' are not allowed yet!');
        };
  })(i);
})();


DateTz.prototype.getTime = function() {
  return +this.date - this.getTimezoneOffset();
};


DateTz.prototype.getTimezoneOffset = function() {
  return this.base_offset + Number(this.is_dst) * 36e5;
};


DateTz.prototype.toString = function() {
  var offset_hour = this.getTimezoneOffset() / 36e5;
  
  return this.getFullYear()    + '.' +
         (this.getMonth() - 1) + '.' +
         this.getDate()        + ' ' +
         this.getHours()       + ':' +
         this.getMinutes()     + ':' +
         this.getSeconds()     + ' ' + 
         'GMT' + (offset_hour >= 0 ? '+' : '-') + Math.abs(offset_hour);
};


DateTz.prototype.valueOf = function() {
  return this.getTime();
};
