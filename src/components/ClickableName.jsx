const ClickableName = ({ name, onClick, hasArrived }) => {
  return (
    <div
      className={`clickable-name${hasArrived ? ' arrived' : ''}`}
      onClick={onClick}
    >
      {name}
    </div>
  );
};

export default ClickableName;
