function [y, b, e] = adaptiveEqualization(inputSignal,desired,trainingSize, order, mu)

    inputSignal = inputSignal(:);
    desired = desired(:);
    N = length(desired);
    b = zeros(order,1);
    trainingSignal = inputSignal(1:trainingSize);

    for i = order:N
        received = trainingSignal(i:-1:i-order+1); 
        e(i) = desired(i)-b'*received;
        b = b + mu*conj(e(i))*received;
    end
    
    y = filter(b,1,inputSignal);
    
end
    
