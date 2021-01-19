package cmd

import (
	"os"

	"db-table/app"
	"db-table/server/http"
	log "github.com/sirupsen/logrus"
	"github.com/spf13/cobra"
)

// serveCmd represents the serve command
var serveCmd = &cobra.Command{
	Use:   "serve",
	Short: "Serves the REST api",
	RunE: func(cmd *cobra.Command, args []string) error {

		app, err := app.New()
		if err != nil {
			log.Error("Error initiating microservice: ", err)
			return err
		}
		defer app.Close()

		err := http.RunServer(app)
		if err != nil {
			log.Fatal("Http Server Is Have Fatal Error: ", err)
			os.Exit(1)
		}

		return nil
	},
}

func init() {
	rootCmd.AddCommand(serveCmd)
}
