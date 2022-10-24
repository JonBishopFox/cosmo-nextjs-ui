import React, { useState, useRef, useEffect } from 'react';
import { Button, Table } from 'reactstrap';
import { withPageAuthRequired } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/router';

import Loading from '../components/Loading';
import ErrorMessage from '../components/ErrorMessage';

function External() {
  const [state, setState] = useState({ isLoading: false, response: undefined, error: undefined });
  const [page, setPage] = useState(2);

  const controllerRef = useRef();
  const router = useRouter();

  useEffect(() => {
    callApi();
  }, []);

  useEffect(() => {
    const exitingFunction = () => {
      cancelApiCall();
    };

    router.events.on('routeChangeStart', exitingFunction);

    return () => {
      console.log('unmounting component...');
      router.events.off('routeChangeStart', exitingFunction);
    };
  }, []);

  const controller = new AbortController();

  const callApi = async () => { 
    cancelApiCall();

    setState(previous => ({ ...previous, isLoading: true }));

    controllerRef.current = controller;

    try {
      const response = await fetch(`/api/v1/orgs/findings/subjects${location.search}`, {
        signal: controllerRef.current?.signal
      });
      const data = await response.json();
      setState(previous => ({ ...previous, response: data, error: undefined, isLoading: false }));
    } catch (error) {
      setState(previous => ({ ...previous, response: undefined, error }));
    } finally {
      setState(previous => ({ ...previous }));
    }
  };

  const cancelApiCall = () => {
    if (controllerRef.current) {
      controllerRef.current.abort();
    }
  };

  const clickHandle = (event, fn) => {
    event.preventDefault();
    setPage(page + 1);

    router.query.page = page;
    router.push(router);

    setTimeout(fn);
  };

  const { isLoading, response, error } = state;

  return (
    <>
      <div className="mb-5" data-testid="external">
        <h1 data-testid="external-title">External API</h1>
        <div data-testid="external-text">
          <p className="lead">Ping an external API by clicking the button below</p>
          <p>
            This will call a local API on port 3001 that would have been started if you run <code>npm run dev</code>.
          </p>
          <p>
            An access token is sent as part of the request's <code>Authorization</code> header and the API will validate
            it using the API's audience value. The audience is the identifier of the API that you want to call (see{' '}
            <a href="https://auth0.com/docs/get-started/dashboard/tenant-settings#api-authorization-settings">
              API Authorization Settings
            </a>{' '}
            for more info).
          </p>
        </div>
        <Button color="primary" className="mt-5" onClick={e => clickHandle(e, callApi)} data-testid="external-action">
          Next Page
        </Button>
      </div>
      <div className="result-block-container">
        {isLoading && <Loading />}
        {(error || response) && (
          <div className="result-block" data-testid="external-result">
            {error && <ErrorMessage>{error.message}</ErrorMessage>}
            {response && (
              <Table>
                <thead striped="true" hover="true" bordered="true" responsive="true">
                  <tr>
                    <th>Finding ID</th>
                    <th>Severity</th>
                    <th>Sub Category</th>
                    <th>Days Opened</th>
                  </tr>
                </thead>
                <tbody>
                  {(response.data || []).map((row, i) => (
                    <tr key={i}>
                      <th scope="row">{row.findingId}</th>
                      <td>{row.severity}</td>
                      <td>{row.subCategory}</td>
                      <td>{row.daysOpened}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default withPageAuthRequired(External);
