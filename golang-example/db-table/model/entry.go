package model

type DbEntry struct {
	ID        string `gorm:"primary_key" json:"id"`
	Name      string `gorm:"unique" json:"name"`
	Token     string `json:"token"`
}

type ErrorData struct {
	Code int    `json:"code"`
	Text string `json:"text"`
}
