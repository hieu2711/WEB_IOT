import React, { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import { Card, CardBody, CardHeader, CardTitle } from 'reactstrap';
import ChartDataLabels from 'chartjs-plugin-zoom';

function ChartCheckServer({ data, name, unit, update }) {
    const [zoomScale, setZoomScale] = useState(1);
    const [isHovered, setIsHovered] = useState(false);

    const gradientStroke = React.useMemo(() => {
        let canvas = document.createElement('canvas');
        let ctx = canvas.getContext('2d');
        let gradientStroke = ctx.createLinearGradient(0, 230, 0, 50);
        gradientStroke.addColorStop(1, 'rgba(72,72,176,0.1)');
        gradientStroke.addColorStop(0.4, 'rgba(72,72,176,0.0)');
        gradientStroke.addColorStop(0, 'rgba(119,52,169,0)');
        return gradientStroke;
    }, []);

    if (!data) {
        return <div>Loading...</div>;
    }
    const chartData = {
        labels: data.map(item => item.day),
        datasets: [
            {
                label: unit,
                fill: true,
                backgroundColor: gradientStroke,
                hoverBackgroundColor: gradientStroke,
                borderColor: data.map(item => item.hasFalseFlag ? '#A52A2A' : '#20B2AA'),
                borderWidth: 2,
                borderDash: [],
                borderDashOffset: 0.0,
                data: data.map(item => item.hasFalseFlag ? 1 : 1),
            },
        ],
    };
    
    
    

    const options = {
        maintainAspectRatio: false,
        plugins: {
            zoom: {
                pan: {
                    enabled: true,
                    mode: 'xy',
                },
                zoom: {
                    wheel: {
                        enabled: true,
                    },
                    pinch: {
                        enabled: true,
                    },
                    mode: 'xy',
                },
            },
        },
    };

    const handleZoomIn = () => {
        setZoomScale(zoomScale * 1.1);
    };
    
    const handleZoomOut = () => {
        setZoomScale(zoomScale * 0.9);
    };
    
    const handleResetZoom = () => {
        setZoomScale(1);
    };

    const handleMouseLeave = () => {
        handleResetZoom();
    };
    console.log(isHovered)
    return (
        <Card className="card-chart">
            <CardHeader>
                <div className='d-flex justify-content-between'>
                    <div>
                        <span style={{fontSize:'1.3rem', cursor: 'pointer'}} onClick={handleZoomIn} className="material-icons">zoom_in</span>
                        <span style={{fontSize:'1.3rem', cursor: 'pointer'}} onClick={handleZoomOut} className="material-icons">zoom_out</span>
                        <span style={{fontSize:'1.3rem', cursor: 'pointer'}} onClick={handleResetZoom} className="material-icons">zoom_out_map</span>
                    </div>
                </div>
                <CardTitle tag="h3">
                    <i className="tim-icons icon-bell-55 text-info" /> {name}
                </CardTitle>
            </CardHeader>
            <CardBody style={{ minHeight: '250px' }}>
                <div className="chart-area" style={{ height: '100%', overflow: 'hidden' }} onMouseLeave={handleMouseLeave}>
                    <div
                        style={{ transform: `scale(${zoomScale})`, transition: 'transform 0.1s ease-in-out' }}
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >
                        <Bar style={{ height: '220px' }} data={chartData} options={options} plugins={[ChartDataLabels]} />
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}

export default ChartCheckServer;
