function message = lms_decode(x)
inputSignal = x;
d = inputSignal(1:80);
training = 80;
order = 8;
mu = 0.001;
[y20, bout, e] = adaptiveEqualization(inputSignal,d,training,order,mu);
filter_s = filterQPSKNoise(y20);
demodBn = QPSK2bin_2(filter_s);
[message, avg, dev, categorized] = bin2text_2(demodBn);