package api

import (
	"encoding/json"
	"net/http"

	"db-table/app"
	_model "db-table/model"
	log "github.com/sirupsen/logrus"
)

type API struct {
	App *app.App
}

func (api *API) Init() error {
	api.App.Router.HandleFunc("/api/db/v1/dbEntry", api.getAllDbEntries).Methods("GET")
	api.App.Router.HandleFunc("/api/db/v1/dbEntry", api.addDbEntry).Methods("POST")
	api.App.Router.HandleFunc("/api/db/v1/dbEntry/{id}", api.updateDbEntry).Methods("PUT")
	api.App.Router.HandleFunc("/api/db/v1/dbEntry/{id}", api.deleteDbEntry).Methods("DELETE")
	api.App.Router.HandleFunc("/api/db/v1/dbEntry/{id}", api.updateDbEntryPatch).Methods("PATCH")
	return nil
}

func sendErr(w http.ResponseWriter, code int, message string) {
	errorData := map[string][]_model.ErrorData{"errors": {
		{
			Code: code,
			Text: message,
		},
	}}
	resp, _ := json.Marshal(errorData)
	http.Error(w, string(resp), code)
	log.Errorf("Http response returned error with code %d and response: %s", code, string(resp))
}
