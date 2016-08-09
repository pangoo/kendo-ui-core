using Kendo.Mvc.Extensions;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;

namespace Kendo.Mvc.UI
{
    /// <summary>
    /// Kendo UI Calendar component
    /// </summary>
    public partial class Calendar 
    {
        public string Culture { get; set; }

        public DateTime[] Dates { get; set; }

        public string Footer { get; set; }

        public string Format { get; set; }

        public DateTime? Max { get; set; }

        public DateTime? Min { get; set; }

        public DateTime? Value { get; set; }

        public CalendarView? Start { get; set; }

        public CalendarView? Depth { get; set; }

        public CalendarMonthTemplateSettings MonthTemplate { get; } = new CalendarMonthTemplateSettings();


        protected override Dictionary<string, object> SerializeSettings()
        {
            var settings = base.SerializeSettings();

            if (Culture?.HasValue() == true)
            {
                settings["culture"] = Culture;
            }

            if (Dates?.Any() == true)
            {
                settings["dates"] = Dates;
            }

            if (Format?.HasValue() == true)
            {
                settings["format"] = Format;
            }

            if (Max.HasValue)
            {
                settings["max"] = Max;
            }

            if (Min.HasValue)
            {
                settings["min"] = Min;
            }

            if (Value.HasValue)
            {
                settings["value"] = Value;
            }

            if (Start.HasValue)
            {
                settings["start"] = Start?.Serialize();
            }

            if (Depth.HasValue)
            {
                settings["depth"] = Depth?.Serialize();
            }


            return settings;
        }
    }
}