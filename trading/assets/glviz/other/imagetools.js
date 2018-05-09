module.exports =
{
    ImageTools: function() {
        this.allSatisfiesCondition = function (pixels, condition) {
            // make sure pixels is valid array
            if ((pixels === undefined) || (pixels.length === undefined) || (pixels.length === 0)) {
                return undefined;
            }

            const LENGTH = pixels.length;

            var i;
            for (i = 0; i < LENGTH; i += 4) {
                // check if pixel satisfies condition
                var pixel = [pixels[i],
                             pixels[i+1],
                             pixels[i+2],
                             pixels[i+3] ];
                if (!condition(pixel)) {
                    // if one pixel doesn't meet condition result is false and function can end
                    return false;
                }
            }
            // all pixels should have met condition by this point
            return true;
        }

        this.anySatisfiesCondition = function (pixels, condition) {
            if ((pixels === undefined) || (pixels === null) || (pixels.length === undefined) || (pixels.length === 0)) {
                return undefined;
            }

            const LENGTH = pixels.length;

            var i;
            for (i = 0; i < LENGTH; i += 4) {
                // check if pixel satisfies condition
                var pixel = [pixels[i],
                             pixels[i+1],
                             pixels[i+2],
                             pixels[i+3] ];
                if (condition(pixel)) {
                    // if one pixel meets the condition result is true
                    return true;
                }
            }
            // no pixels met condition
            return false;
        }

        this.noneSatisfiesCondition = function (pixels, condition) {
            // validate pixels
            if ((pixels === undefined) || (pixels.length === undefined) || (pixels.length === 0)) {
                return undefined;
            }
            // noneSatisfies is essentially !anySatisfiesCondition
            if (this.anySatisfiesCondition(pixels, condition)) {
                return false;
            } else {
                return true;
            }
        }

        this.getFractionSatisfyingCondition = function (pixels, condition) {
            // check pixels is okay
            if ((pixels === undefined) || (pixels.length === undefined) || (pixels.length === 0)) {
                return undefined;
            }

            const LENGTH = pixels.length;

            var n_passed = 0;
            var i;
            for (i = 0; i < LENGTH; i += 4) {
                var pixel = [pixels[i],
                             pixels[i+1],
                             pixels[i+2],
                             pixels[i+3] ];
                // count number of pixels meeting condition
                if (condition(pixel)) {
                    ++n_passed;
                }
            }

            // return percentage meeting condition
            return 4 * n_passed / LENGTH;
        }
    }
}