/**
 *  Time domain notes:
 *          -- Start, Stop time vals on X axis
 *          -- Graph Title
 *          -- Set Font + Size
 *          -- Marker COlor corresponds to Text Color of annotation box/zone
 *          -- Marker Style: toggle some marker shape types (diamond, circle, cross)
 *          -- Set annotation text color (white default)
 *          -- Set Background color (black default)
 *          -- set bounding box border thickness + color (cyan by default)
 *          -- Set Grid Color
 *          -- Define set of colors to use for N traces (gets plucked out as data added)
 *         -- Also set of colors for Markers(SYmbols) to use when markers added
 *        -- Dubious: "Y Transform" (think it is fixed to real for time domain plot)
 *        -- Grid Size relative to total canvas should scale in response to
 *                     font size and contents (e.g. font size 160 should shrink down the grid a lot)
 *       -- Y-axis: show the step per division of grid on Y-axis (e.g. 500 mV/div)
 *        -- Note: X axis does NOT show per div values, just shows start + stop
 *        -- Allow passing in purely Y-values along with X start and Step (stop is Npts x step)
 *        -- Allow "autoscale" of Y axis range that picks "reasonably nice" numbers.
 *        --  Allow calling autoscale ONCE to set range but not bounce around constantly.
 *        -- Set X and Y units as strings
 *       -- Marker crosshairs enabled: fill grid out from marker in "rook" pattern
 *       -- Marker placement: 1. Sample Markers (at data index that change with Y value)
 *                            2. Max/Min + Peak/Valley
 *                            3. Delta Markers (NOT PRESENT IN OPENGLMEAS NOW)
 *          -- Marker symbols clip to draw only in the grid region
 */