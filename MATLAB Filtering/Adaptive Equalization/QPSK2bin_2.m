%% demodBn = QPSK2bin(Bits_stream)
% Takes in a stream of QPSK values and demodulates into binary values
% Input: 
%     Bits_stream: Input array of complex QPSK values
% Output: 
%     demodBn: Output array of binary values

function demodBn = QPSK2bin_2(Bits_stream)

bin = [];
count = 1;
numBits = length(Bits_stream);
currBin = [];
for i = 1:numBits
    currQPSK = Bits_stream(i);
        if angle(currQPSK) == angle(1+j)
            currBitEven = '0';
            currBitOdd = '0';
        elseif angle(currQPSK) == angle(-1+j)
            currBitEven = '1';
            currBitOdd = '0';
        elseif angle(currQPSK) == angle(1-j)
            currBitEven = '0';
            currBitOdd = '1';
        elseif angle(currQPSK) == angle(-1-j)
            currBitEven = '1';
            currBitOdd = '1';
        else
            disp('error');
        end
        if count == 9
            currBin = [currBin currBitEven currBitOdd];
            bin = [bin;currBin(1:5);currBin(6:10)];
            count = -1;
            currBin = [];
        else
            currBin = [currBin currBitEven currBitOdd];
        end
        count = count + 2;
        
end
demodBn = bin;