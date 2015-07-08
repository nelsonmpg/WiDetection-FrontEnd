#include<stdio.h>       //printf
#include<string.h>      //strlen
#include<sys/socket.h>  //socket
#include<arpa/inet.h>   //inet_addr
#include<pthread.h>     //threads
#include <stdlib.h>
#include <limits.h>
#include <sys/stat.h>

#define FILECFG "Config.ini"
#define MAXBUF 1024 
#define DELIM "="

struct config {
    char ipserver[MAXBUF];
    char portServer[MAXBUF];
    char nameAnt[MAXBUF];
};

int sock;
long sz;
char const* const fileName = "fileDiff.csv";
char line[256];
FILE* file;
size_t size;
int portSrv;
const char * serverIp;
const char * antenaNome;

struct config get_config(char *filename) {
    struct config configstruct;
    FILE *file = fopen(filename, "r");
    if (file != NULL) {
        char line[MAXBUF];
        int i = 0;
        while (fgets(line, sizeof (line), file) != NULL) {
            char *cfline;
            cfline = strstr((char *) line, DELIM);
            cfline = cfline + strlen(DELIM);

            if (i == 0) {
                memcpy(configstruct.ipserver, cfline, strlen(cfline));
                //printf("%s",configstruct.imgserver);
            } else if (i == 1) {
                memcpy(configstruct.portServer, cfline, strlen(cfline));
                //printf("%s",configstruct.ccserver);
            } else if (i == 2) {
                memcpy(configstruct.nameAnt, cfline, strlen(cfline));
                //printf("%s",configstruct.port);
            }
            i++;
        } // End while
    } // End if file
    fclose(file);
    return configstruct;
}

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

    server.sin_addr.s_addr = inet_addr(serverIp);
    server.sin_family = AF_INET;
    server.sin_port = htons(portSrv);

    if (connect(sock, (struct sockaddr *) &server, sizeof (server)) < 0) {
        perror("connect failed. Error");
    }
    puts("Connected\n");

    if (send(sock, antenaNome, strlen(antenaNome), 0) < 0) {
        puts("Send failed");
    }

    while (1) {
        system("./runDifFile.sh");
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

int main(int argc, char *argv[]) {
	system("./clearFiles.sh");
    struct config configstruct;
    configstruct = get_config(FILECFG);

    serverIp = configstruct.ipserver;
    antenaNome = configstruct.nameAnt;
    portSrv = atoi(configstruct.portServer);

    pthread_t threadp1;
    pthread_t threadp2;

    pthread_create(&threadp1, NULL, StartAirDump, NULL);
    pthread_create(&threadp2, NULL, SendDiffFile, NULL);

    close(sock);
    pthread_exit(NULL); // main thread quits

    return 0;
}