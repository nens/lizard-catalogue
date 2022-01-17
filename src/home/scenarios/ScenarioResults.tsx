import React, { useEffect, useState } from 'react';
import ResultCard from '../../components/ResultCard';

interface MyProps {
  uuid: string
}

interface ScenarioResult {
  id: number,
  url: string,
  scenario: string,
  raster: string,
  attachment_url: string,
  result_type: {
    name: string,
    code: string,
    layer_description: string
  }
}

export interface Results {
  isFetching: boolean,
  results: ScenarioResult[]
}

export type ResultType = 'raw' | 'basic' | 'arrival' | 'damage';

const initialResults: Results = {
  isFetching: false,
  results: []
};

// Helper function to fetch scenario results
const fetchScenarioResults = async (
  uuid: string,
  resultType: ResultType,
  setResults: React.Dispatch<React.SetStateAction<Results>>,
) => {
  setResults(results => ({
    ...results,
    isFetching: true
  }));

  const apiResponse = await fetch(`/api/v4/scenarios/${uuid}/results/${resultType}/`);

  if (!apiResponse.ok) {
    console.error(`Failed retrieving ${resultType} scenario results: `, apiResponse.status, apiResponse);
    setResults(results => ({
      ...results,
      isFetching: false
    }));
    return;
  };

  const jsonResponse = await apiResponse.json();
  setResults({
    isFetching: false,
    results: jsonResponse.results
  });
};

export default function ScenarioResults (props: MyProps) {
  const { uuid } = props;
  const [rawResults, setRawResults] = useState<Results>(initialResults);
  const [basicResults, setBasicResults] = useState<Results>(initialResults);
  const [arrivalResults, setArrivalResults] = useState<Results>(initialResults);
  const [damageResults, setDamageResults] = useState<Results>(initialResults);

  // useEffect to fetch different scenario results
  useEffect(() => {
    fetchScenarioResults(uuid, 'raw', setRawResults);
    fetchScenarioResults(uuid, 'basic', setBasicResults);
    fetchScenarioResults(uuid, 'arrival', setArrivalResults);
    fetchScenarioResults(uuid, 'damage', setDamageResults);
  }, [uuid]);

  return (
    <div>
      <ResultCard
        resultType='raw'
        results={rawResults}
      />
      <ResultCard
        resultType='basic'
        results={basicResults}
      />
      <ResultCard
        resultType='arrival'
        results={arrivalResults}
      />
      <ResultCard
        resultType='damage'
        results={damageResults}
      />
    </div>
  )
}