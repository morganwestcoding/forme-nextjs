import states from 'states-us';

const formattedStates = states.map((state) => ({
  value: state.abbreviation,  // Typically, state abbreviations are used as unique identifiers
  label: state.name,          // The full name of the state
}));

const useStates = () => {
  const getAll = () => formattedStates;

  const getByValue = (value: string) => {
    return formattedStates.find((item) => item.value === value);
  }

  return {
    getAll,
    getByValue
  }
};

export default useStates;