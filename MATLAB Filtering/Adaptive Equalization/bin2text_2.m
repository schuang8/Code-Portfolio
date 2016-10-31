%% [T,avg,dev,categorized] = bin2text(Bits_stream)
% Converts the given array of binary values into its original text into its
% lowercase form.
% Input:
%     Bits_stream: Input array of binary values
% Output:
%     bn: Output array of binary values
%     avg: Output value of the numerical average of ascii values
%     dev: Output value of the numerical standard deviation of ascii values
%     categorized: Output array of ascii values based on their frequencies

function [T, avg, dev, categorized] = bin2text_2(Bits_stream)

asciiVals = [];
bitLength = length(Bits_stream);
for i = 1:bitLength
    currBin = Bits_stream(i,:);
    currASCII = bin2dec(currBin);
    asciiVals = [asciiVals currASCII];
end
histBins = 6:31;
letterInds = find((asciiVals >= 6) & (asciiVals<=31));
% hist(asciiVals(letterInds),histBins);
avg = mean(asciiVals(letterInds));
dev = std(asciiVals);
spcInd = find(asciiVals == 0);
comaInd = find(asciiVals == 1);
perInd = find(asciiVals == 2);
aposInd = find(asciiVals == 3);
lineInd = find(asciiVals == 4);
retInd = find(asciiVals == 5);
asciiVals = asciiVals + 91;
asciiVals(spcInd) = 32;
asciiVals(comaInd) = 44;
asciiVals(perInd) = 46;
asciiVals(aposInd) = 39;
asciiVals(lineInd) = 10;
asciiVals(retInd) = 13;
freq = histc(asciiVals,histBins);
categorized = [histBins;freq];
newTxt = char(asciiVals);
T = newTxt;