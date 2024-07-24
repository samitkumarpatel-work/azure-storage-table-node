//read the JOSN file and write it to azure table storage
const fs = require('fs');
require('dotenv').config();
const { TableServiceClient, TableClient, AzureNamedKeyCredential, odata } = require("@azure/data-tables");
const { randomUUID } = require('crypto');


const connectionString = process.env.CONNECTION_STRING;
const tableName = process.env.TABLE_NAME || 'myFinanceMetrics';
const accountName = process.env.ACCOUNT_NAME;
const tableService = TableServiceClient.fromConnectionString(connectionString);
const tableURI = `https://${accountName}.table.core.windows.net`;
const filePath = process.env.FILE_PATH || 'data.json';

const data = fs.readFileSync(filePath, 'utf8');
const jsonData = JSON.parse(data);

const persist = async () => {
    await tableService.createTable(tableName)
        .then((tableClient) => {
            console.log(`Table "${tableName}" is created`);
        })
        .catch((err) => {
            console.error(err);
        })

    //const tableClient = new TableClient(tableName, tableService);
    const tableClient = new TableClient(
        tableURI,
        tableName,
        tableService
      );
    
    jsonData.forEach((item, index) => {
        const entity = {
            partitionKey: item.metricName,
            rowKey: index.toString(),
            metricName: item.metricName,
            metricJsonBody: item.metricJsonBody
        }
        tableClient.createEntity(entity)
            .then(() => {
                console.log(`Entity ${item.metricName} is created`);
            })
            .catch((err) => {
                console.error("ERROR");
            });
    });
}



const retrive = async () => {
    const tableClient = new TableClient(
        tableURI,
        tableName,
        tableService
      );

      tableClient.getEntity("agentInvoiceSearch", "1")
      .then((entity) => {
        console.log(`Entity: ${entity.metricName}, ${entity.metricJsonBody}`);
      })
      .catch((error) => {
        console.error("ERROR");
      });
};

//persist();
retrive();