function digits = tt_decode(x)

signal = x;
fs = 8000;

% Normalize the data 
signal = signal - mean(signal);
signal = signal./max(abs(signal));

N = 205; % Standard length of a dial tone
sampSetSize = floor(length(signal)/N);

% DTMF frequency
f = [697, 770, 852, 941, 1209, 1336, 1477, 1633];
dtmf = [['1', '2', '3', 'a']; ['4', '5', '6', 'b']; ['7', '8', '9', 'c']; ['*', '0', '#', 'd'];];
fSize = length(f);
freqIndices = round(f/fs*N) + 1;

gfft = zeros(fSize,sampSetSize);

% Find the Goertzel DFT using column sets of 8 for each DTMF frequency
for i = 0:1:sampSetSize-1
    frame = signal(i*N+1:(i+1)*N);   
    gfft(:,i+1) = abs(goertzel(frame,freqIndices));
end

% Calculate threshold values for the dft values using statistics for each
% column
avg = mean(gfft,2);
variance = var(gfft,1,2);
std = sqrt(variance);

Y = zeros(fSize,sampSetSize);

% Eliminate extraneous threshold values
threshold = avg + std;
threshold(std < 1) = 1000;


% Compare calculated data in X to threshold and store in Y
for i = 1:1:sampSetSize
    Y(:,i) = gfft(:,i) > threshold;
end

% Extraneous values are set to zero
Y(:,sum(Y,1) <= 1) = 0;

sigDurOnes = [];
count = 0;

% Determine the DTMF numbers based on the filtered values
dtmfString = [];
for i = 1:1:sampSetSize
    % Determines when the dial ends
    if sum(Y(:,i)) == 0
        if (~isempty(sigDurOnes) && count >= 2)
            freqInd = find(sigDurOnes == 1);
            dtmfString = [dtmfString, dtmf(freqInd(1), freqInd(2)-4)];
        end
        count = 0;
        sigDurOnes = [];
    % Starts counting the length of the dial
    elseif sum(Y(:,i)) == 2
        if ~isempty(sigDurOnes)
            if ~isequal(sigDurOnes, Y(:,i))
                disp('Not Matching');
            end
        else
            sigDurOnes = Y(:,i);
        end        
        count = count + 1;
    end
end

digits = num2str(dtmfString);