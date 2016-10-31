function [filtered] = filterQPSKNoise(signal)


numBits = length(signal);
outBin = [];
for i = 1:numBits
    currQPSK = signal(i);
    
    realCurrQPSK = real(currQPSK);
    if sign(realCurrQPSK) == 1
        realCurrQPSK = ceil(realCurrQPSK);
    else
        realCurrQPSK = floor(realCurrQPSK);
    end
    
    imagCurrQPSK = imag(currQPSK);
    if sign(imagCurrQPSK) == 1
        imagCurrQPSK = ceil(imagCurrQPSK);
    else
        imagCurrQPSK = floor(imagCurrQPSK);
    end
    
    if abs(realCurrQPSK) > 1
        if sign(realCurrQPSK) == 1
            realCurrQPSK = 1;
        else
            realCurrQPSK = -1;
        end
    end
    if abs(imagCurrQPSK) > 1
        if sign(imagCurrQPSK) == 1
            imagCurrQPSK = 1;
        else
            imagCurrQPSK = -1;
        end
    end
    outBin = [outBin;(realCurrQPSK+j*imagCurrQPSK)];
end
filtered = outBin;
    