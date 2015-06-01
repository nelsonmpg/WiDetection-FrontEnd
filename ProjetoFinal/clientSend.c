#include<stdio.h>       //printf
#include<string.h>      //strlen
#include<sys/socket.h>  //socket
#include<arpa/inet.h>   //inet_addr
#include<pthread.h>     //threads
#include <stdlib.h>
#include <limits.h>
#include <sys/stat.h>

int sock;
long sz;
char const* const fileName = "fileDiff.csv";
char line[256];
FILE* file;
size_t size;

off_t fsize(const char *filename) {
    struct stat st;

    if (stat(filename, &st) == 0) {
        return st.st_size;
    }

    return -1;
}

void * StartAirDump(void *arg) {
    system("airodump-ng mon0 -w scanNetworks --output-format csv");
}

void * SendDiffFile(void *arg) {

    struct sockaddr_in server;

    sock = socket(AF_INET, SOCK_STREAM, 0);
    if (sock == -1) {
        printf("Could not create socket");
    }
    puts("Socket created");

    server.sin_addr.s_addr = inet_addr("192.168.41.1");
    server.sin_family = AF_INET;
    server.sin_port = htons(8888);

    if (connect(sock, (struct sockaddr *) &server, sizeof (server)) < 0) {
        perror("connect failed. Error");
    }
    puts("Connected\n");

    while (1) {
        system("./runDifFile.sh");
        system("./copyFile.sh");
        file = fopen(fileName, "r");
        sz = fsize(fileName);
        if (sz > 10) {
            while (fgets(line, sizeof (line), file)) {
                if (send(sock, line, strlen(line), 0) < 0) {
                    puts("Send failed");
                }
            }
        }

        fclose(file);
        sleep(1);
    }
}

void main(int argc, char *argv[]) {
    pthread_t threadp1;
    pthread_t threadp2;

    pthread_create(&threadp1, NULL, StartAirDump, NULL);
    pthread_create(&threadp2, NULL, SendDiffFile, NULL);

    close(sock);
    pthread_exit(NULL); // main thread quits


}