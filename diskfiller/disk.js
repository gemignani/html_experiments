let isRunning = false;
document.addEventListener("keyup", function(event) {
    console.log("Got " + event.keyCode);
    if (event.keyCode === 49) { //1
        try {
            localStorage.removeItem("exampleData");
            console.log("Likely deleted exampleData");
            document.getElementById('result').innerText = "EMPTY";
        } catch (error) {
            console.error('Error clear item in localStorage:' + error.message);
            document.getElementById('result').innerText = error.message;
        }
        updateStorageSize();
        updateStorageSize2();
    }
    if (event.keyCode === 50) { //2
        try {
            localStorage.removeItem("exampleData2");
            console.log("Likely deleted exampleData");
            document.getElementById('result').innerText = "EMPTY";
        } catch (error) {
            console.error('Error clear item in localStorage:' + error.message);
            document.getElementById('result').innerText = error.message;
        }
        updateStorageSize();
        updateStorageSize2();
    }
    // if (event.keyCode === 51) { //3
    //     addDataToLocalStorage(3 * 1024);
    //     updateStorageSize();
    //     updateStorageSize2();
    // }

    if (event.keyCode === 52) { //4
        
        if (isRunning) {
            console.log("Function is already running. Skipping.");
            return;
        }
    
        isRunning = true;
        let sizeInKB = 4; // Initial size in KB
        let intervalId; // Variable to store the interval ID
        intervalId = setInterval(function () {
            addDataToLocalStorage(sizeInKB, function(){clearInterval(intervalId);isRunning = false;});
            sizeInKB += 4; // Increase size by 8 KB for the next iteration
            updateStorageSize();
        }, 1000);

    }

    if (event.keyCode === 53) { //5
        addDataToLocalStorage(512);
        updateStorageSize();
        updateStorageSize2();
    }
    if (event.keyCode === 54) { //6
        addDataToLocalStorage(256);
        updateStorageSize();
        updateStorageSize2();
    }
    if (event.keyCode === 55) { //7
        addDataToLocalStorage(128);
        updateStorageSize();
        updateStorageSize2();
    }

    if (event.keyCode === 56) { //8
        addDataToLocalStorage_alt(128);
        updateStorageSize();
        updateStorageSize2();
    }

    if (event.keyCode === 57) { //9
        addDataToLocalStorage_alt(64);
        updateStorageSize();
        updateStorageSize2();
    }

    if (event.keyCode === 48) { //0
        
        updateStorageSize();
        updateStorageSize2();
    }
    
    if (event.keyCode === 27) { //BACK
        window.close();
    }
});

function calculateByteSize(str) {
    return new TextEncoder().encode(str).length;
}

function generateRandomString(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength = characters.length;
    console.log("Generating random " + length)
    console.log("charactersLength " + charactersLength)
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function addDataToLocalStorage(sizeInKB, err) {
    console.log("Adding " + sizeInKB)
    let dataSize = sizeInKB * 1024; // Convert kb to bytes
    let data = generateRandomString(dataSize);
    // const byteSize = calculateByteSize(data);
    console.log("data.length " + data.length)
    // console.log("data byteSize " + byteSize)
    try {
        localStorage.setItem('exampleData', data);
        console.log("Likely Added exampleData");
        document.getElementById('result').innerText = "EMPTY";
    } catch (error) {
        console.error('Error setting item in localStorage:' + error.message);
        document.getElementById('result').innerText = error.message;
        if (err) err();
    }
}

function addDataToLocalStorage_alt(sizeInKB) {
    console.log("Adding ALT " + sizeInKB)
    let dataSize = sizeInKB * 1024; // Convert kb to bytes
    let data = generateRandomString(dataSize);
    console.log("data.length " + data.length)
    try {
        localStorage.setItem('exampleData2', data);
        console.log("Likely Added exampleData2");
        document.getElementById('result').innerText = "EMPTY";
    } catch (error) {
        console.error('Error setting item in localStorage:' + error.message);
        document.getElementById('result').innerText = error.message;
    }
}


function updateStorageSize() {
    try {
        const localitem = localStorage.getItem('exampleData');
        if (localitem === null) {
            console.log('Item not found in localStorage.');
            document.getElementById('size').innerText = "NULL";
        } else {
            let localitemlen = localitem.length;
            console.log("updateStorageSize localitemlen " + localitemlen)
            document.getElementById('size').innerText = localitemlen;
        }
    } catch (error) {
        console.error('Error setting item in localStorage: ' + error.message);
        document.getElementById('size').innerText = error.message;
    }

}

function updateStorageSize2() {
    try {
        const localitem = localStorage.getItem('exampleData2');
        if (localitem === null) {
            console.log('Item not found in localStorage2.');
            document.getElementById('size2').innerText = "NULL";
        } else {
            let localitemlen = localitem.length;
            console.log("updateStorageSize2 localitemlen " + localitemlen)
            document.getElementById('size2').innerText = localitemlen;
        }
    } catch (error) {
        console.error('Error setting item in localStorage2: ' + error.message);
        document.getElementById('size2').innerText = error.message;
    }

}

document.addEventListener('DOMContentLoaded', function () {
    console.log("DOMContentLoaded LOADED");
    document.getElementById('loaded').innerText = "DOMContentLoaded LOADED";
    updateStorageSize();
    updateStorageSize2();
});
