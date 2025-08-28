const style = {
  box: {
    display: 'inline-block',
    padding: '8px 12px',
    margin: '6px',
    border: '1px solid #e0e0e0',
    borderRadius: '8px',
    background: '#fff',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
    cursor: 'pointer',
    userSelect: 'none',
    minWidth: '100px',
    textAlign: 'center',
  },
};

const ClickableName = ({ name, onClick, hasArrived }) => {
  return (
    <div className="clickable-name" style={{ ...style.box, backgroundColor: hasArrived ? '#e0ffe0' : '#fff' }} onClick={onClick}>
      {name}
    </div>
  );
};

export default ClickableName;
