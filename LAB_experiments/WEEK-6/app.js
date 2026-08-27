// console.log("Hello World");
const os = require('os');
const path = require('path');
const dns = require('dns');
const net = require('net');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function toGB(bytes) {
    return (bytes / (1024 ** 3)).toFixed(2);
}

console.log("=".repeat(10),"NODE SYSTEM AND NETWORK INFORMATION","=".repeat(10));
console.log("1. Operating System Information");
console.log("2. File Path Information");
console.log("3. DNS Lookup");
console.log("4. TCP Server");
console.log("5. Exit");
rl.question("Enter Your Choice:", (choice) => {
    switch(choice){
        case "1":
            console.log("OS Information");
            osInfo();
            rl.close()
            break;
        case "2":
            console.log("File Path Information:");
            fpInfo();
            break;
        case "3":
            console.log("DNS Lookup:");
            dnsInfo();
            break;
        case "4":
            console.log("TCP Server");
            tcpServer();
            break;
        case "5":
            console.log("Exiting....");
            rl.close()
            break;
        default:
            console.log("Invalid Choice!");
    }
});

function osInfo(){
    console.log("Platform:", os.platform());
    console.log("Architecture:", os.arch());
    console.log("CPU Information:", os.cpus());
    console.log("Total Memory:",toGB(os.totalmem()) ,"GB");
    console.log("Free Memory:", toGB(os.freemem()),"GB");
}
function fpInfo(){
    rl.question("Enter a File Path: " , (filePath) => {
    console.log("Directory Name:", path.dirname(filePath));
    console.log("File Name:",path.basename(filePath));
    console.log("Extension:", path.extname(filePath));
    console.log("Normalized path:", path.normalize(filePath));
    rl.close()
});
}
function dnsInfo(){
    rl.question("Enter a Domain Name: ", (domainName) =>{
    dns.lookup(domainName, (err,address) => {
        if (err) {
            console.log("Error Occured", err.message);
        } else{
            console.log("IP Address is:", address)
        }
        rl.close();
    });
})
}
function tcpServer(){
    const server = net.createServer((socket) => {
    console.log("Client connected!");
    socket.write("Welcome to my TCP server!");
    socket.on("end", () => {
        console.log("Client disconnected.");
    });
});
server.listen(5000, () => {
    console.log("TCP server is running on port 5000");
});
}