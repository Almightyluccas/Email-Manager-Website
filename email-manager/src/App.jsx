import { useState } from "react";
import config from './private/bodyConfig';
import ReactJson from 'react-json-view';

function App() {
  const [totalFetchedEmails, setTotalFetchedEmails] = useState(0);
  const [fetchTime, setFetchTime] = useState(0);
  const [jsonDataList, setJsonDataList] = useState([]);
  const [expandedColumns, setExpandedColumns] = useState([]);
  const [expandEmails, setExpandEmails] = useState(false);

  const handleFetchClick = async () => {
    try {
      const startTime = new Date().getTime();

      const response = await fetch('https://email-manager-restapi-staging-4cd12bf74fde.herokuapp.com/api/v1/emails/all/inbox', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: config.email,
          password: config.password,
          provider: config.provider
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const fetchedCount = data['fetched']['totalFetched'];
        setTotalFetchedEmails(prevTotal => prevTotal + fetchedCount);

        const endTime = new Date().getTime();
        const timeTaken = (endTime - startTime) / 1000;
        setFetchTime(timeTaken);

        setJsonDataList(prevList => [...prevList, data]);

        setExpandedColumns(prevColumns => [...prevColumns, false]);
      } else {
        console.error('Request failed:', response.status);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const toggleExpandEmails = () => {
    setExpandEmails(!expandEmails);
  };

  const toggleAllExpansion = () => {
    setExpandedColumns((prevColumns) =>
      prevColumns.map(() => !prevColumns[0])
    );
  };

  return (
    <div className="App">
      <header className="App-header">
        <p>
          <button onClick={handleFetchClick}>
            Fetch Emails
          </button>
          <button onClick={toggleAllExpansion}>
            {expandedColumns[0] ? 'Collapse All' : 'Expand All'}
          </button>
          <button onClick={toggleExpandEmails}>
            {expandEmails ? 'Collapse Emails' : 'Expand Emails'}
          </button>
        </p>
        <div className="card">
          <p>
            Total number of fetched emails: {totalFetchedEmails}
          </p>
          <p>
            Time taken to fetch emails: {fetchTime} seconds
          </p>
        </div>
        <div>
          {jsonDataList.map((jsonData, index) => (
            <div key={index}>

              <ReactJson
                src={jsonData}
                theme="rjv-default"
                displayDataTypes={false}
                enableClipboard={false}
                collapseStringsAfterLength={20}
                shouldCollapse={(field) => {
                  if (field.name === "root") return false;
                  if (field.name === "emails") return !expandEmails; // Toggle "emails" field
                  return field.depth > 2;
                }}
                collapsed={!expandedColumns[index]}
              />
            </div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;
