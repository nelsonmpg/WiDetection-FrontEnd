#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>

#include "./src/configini.h"


#define LOG_ERR(fmt, ...)	\
	fprintf(stderr, "[ERROR] <%s:%d> : " fmt "\n", __FUNCTION__, __LINE__, __VA_ARGS__)

#define LOG_INFO(fmt, ...)	\
	fprintf(stderr, "[INFO] : " fmt "\n", __VA_ARGS__)


#define CONFIGREADFILE	"./config.ini"

#define ENTER_TEST_FUNC														\
	do {																	\
		LOG_INFO("%s", "\n-----------------------------------------------");\
		LOG_INFO("<TEST: %s>\n", __FUNCTION__);								\
	} while (0)







static void Test2() {
    Config *cfg = NULL;

    /* set settings */
    cfg = ConfigNew();
    ConfigSetBoolString(cfg, "yes", "no");

    /* we can give initialized handle (rules has been set) */
    if (ConfigReadFile(CONFIGREADFILE, &cfg) != CONFIG_OK) {
        LOG_ERR("ConfigOpenFile failed for %s", CONFIGREADFILE);
        return;
    }

    ConfigRemoveKey(cfg, "geral", "ip");
    ConfigRemoveKey(cfg, "geral", "port");

    //ConfigAddBool(cfg, "SECT1", "isModified", true);
    //ConfigAddString(cfg, "owner", "country", "Turkey");

    ConfigPrintSettings(cfg, stdout);
    ConfigPrint(cfg, stdout);
    //ConfigPrintToFile(cfg, CONFIGSAVEFILE);

    ConfigFree(cfg);
}

int main() {
    Test2();

    return 0;
}