#include<stdio.h>       //printf
#include<string.h>      //strlen
#include<sys/socket.h>  //socket
#include<arpa/inet.h>   //inet_addr
#include<pthread.h>     //threads
#include <stdlib.h>
#include <limits.h>
#include <sys/stat.h>

void * StartAirDump(void *arg) {
  system("sudo airodump-ng mon0 -w scanNetworks --output-format csv");
}

int main(int argc, char *argv[]) {
  system("sudo ./clearFiles.sh");
  //pthread_t threadp1;

  sleep(3);
  system("sudo nohup airodump-ng mon0 -w /media/usb/scanNetworks --output-format csv > /dev/null 2>&1");
  
  //pthread_create(&threadp1, NULL, StartAirDump, NULL);
  printf("Start Airmon.\n");

  //pthread_exit(NULL); // main thread quits

  return 0;
}