VAR3=`date +"%Y"`
curl "https://www.polizei-berlin.eu/Fahrraddiebstahl/Fahrraddiebstahl.csv" > /var/www/virtual/gustav/biketheft.gustav.uber.space/data-${VAR3}.csv
