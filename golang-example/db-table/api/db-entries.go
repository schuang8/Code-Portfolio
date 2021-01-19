package api

import (
	"encoding/json"
	"net/http"

	"db-table/model"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	log "github.com/sirupsen/logrus"
)

func (api *API) getAllDbEntries(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var all []model.DbEntry
	err := api.App.Database.Find(&all).Error
	if err != nil {
		sendErr(w, http.StatusInternalServerError, err.Error())
		return
	}
	err = json.NewEncoder(w).Encode(map[string][]model.DbEntry{"data": all})
	if err != nil {
		sendErr(w, http.StatusInternalServerError, err.Error())
	}
}

func (api *API) addDbEntry(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var entry model.DbEntry
	err := json.NewDecoder(r.Body).Decode(&entry)
	if err != nil {
		sendErr(w, http.StatusBadRequest, err.Error())
		return
	}

	entry.ID = uuid.New().String()
	err = api.App.Database.Save(&entry).Error
	if err != nil {
		sendErr(w, http.StatusInternalServerError, err.Error())
	} else {
		w.WriteHeader(http.StatusCreated)
		err := json.NewEncoder(w).Encode(map[string]model.DbEntry{"data": entry})
		if err != nil {
			log.Errorf("%s", err.Error())
		}
	}
}

func (api *API) updateDbEntry(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var s model.DbEntry
	err := json.NewDecoder(r.Body).Decode(&s)
	if err != nil {
		sendErr(w, http.StatusBadRequest, err.Error())
		return
	}
	s.ID = mux.Vars(r)["id"]
	err = api.App.Database.Save(&s).Error
	if err != nil {
		sendErr(w, http.StatusInternalServerError, err.Error())
	}
}

func (api *API) deleteDbEntry(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	err := api.App.Database.Unscoped().Delete(model.DbEntry{ID: mux.Vars(r)["id"]}).Error
	if err != nil {
		sendErr(w, http.StatusInternalServerError, err.Error())
	}
}

func (api *API) updateDbEntryPatch(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	var s model.DbEntry
	err := json.NewDecoder(r.Body).Decode(&s)
	if err != nil {
		sendErr(w, http.StatusBadRequest, err.Error())
		return
	}
	s.ID = mux.Vars(r)["id"]
	err = api.App.Database.Model(&s).Update(s).Error
	if err != nil {
		sendErr(w, http.StatusInternalServerError, err.Error())
	}
}
